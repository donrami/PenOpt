# PenOpt MCP Server

> **Let AI assistants optimize CT scanning orientations.** This headless binary provides Model Context Protocol (MCP) tools that LLMs like Claude can use to load 3D meshes, run orientation optimization, and inspect results — all locally, with no network transfer of your mesh data.

[![Go 1.25+](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat-square&logo=go)](https://go.dev/dl/)
[![MCP](https://img.shields.io/badge/MCP-2025--11--25-blue?style=flat-square)](https://modelcontextprotocol.io)

---

## Quick Start

### 1. Download

Download `penopt-mcp-{platform}` from the [latest release](https://github.com/donrami/PenOpt/releases).

| Platform | File |
|---|---|
| Linux (amd64) | `penopt-mcp-linux-amd64` |
| Windows (amd64) | `penopt-mcp-windows-amd64.exe` |
| macOS (Intel) | `penopt-mcp-darwin-amd64` |
| macOS (Apple Silicon) | `penopt-mcp-darwin-arm64` |

Make it executable and place it somewhere in your `PATH`:

```bash
chmod +x penopt-mcp-*
mv penopt-mcp-* /usr/local/bin/penopt-mcp
```

### 2. Configure Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "penopt": {
      "command": "/usr/local/bin/penopt-mcp",
      "args": []
    }
  }
}
```

**Config file locations:**

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

Restart Claude Desktop after adding the config. You'll see a hammer icon 🔨 in the bottom-right corner indicating tools are available.

### 3. Use it

Ask Claude something like:

> *"Load /home/user/part.stl and find the optimal CT scan orientation with equal weights."*

The assistant will call `load_mesh` followed by `run_optimization` and present the results in natural language.

### 4. Configure Claude Code

```bash
claude mcp add penopt -- /usr/local/bin/penopt-mcp
```

Then just ask:

```
claude "Load ~/part.stl and optimize the CT orientation"
```

---

## Tools Reference

### `load_mesh`
Load a 3D triangle mesh from an STL or OBJ file.

- **Input:** `path` (string, required) — absolute path to `.stl` or `.obj` file
- **Output:** mesh metadata (triangle count, vertex count, watertight status, bounding box, center, extent)
- **Errors:** file not found, unsupported format, parse failure, empty mesh
- **Side effects:** replaces any previously loaded mesh in server memory

### `get_mesh_info`
Get metadata for the currently loaded mesh without reloading it.

- **Input:** none
- **Output:** same metadata as `load_mesh`
- **Errors:** no mesh loaded

### `evaluate_orientation`
Evaluate a single (θ, φ) orientation and return all objective values.

- **Input:**
  - `theta` (number, required) — tilt around X-axis in degrees
  - `phi` (number, required) — rotation around Y-axis in degrees
- **Output:** fMtl, fEnergy, fHdn, fTuy, fBh, combined score
- **Errors:** no mesh loaded, invalid angles (NaN, Inf)

### `run_optimization`
Run the full coarse→fine grid search to find the optimal CT scanning orientation.

- **Input (all optional with defaults):**
  - `weights` — array of 5 numbers: [fMtl, fEnergy, fHdn, fTuy, fBh]. Default: equal weights `[0.2, 0.2, 0.2, 0.2, 0.2]`
  - `method` — `"weighted"` (default) or `"minimax"`
  - `rayGridXY` — 0 = auto (default), 8 = fast, 16 = standard, 32 = highest fidelity
  - `searchRange` — 0 = 45° (default), min 30°, max 75°
- **Output:** best orientation (θ, φ, all 5 objectives, score), worst score, search time, convergence diagnostics, warnings
- **Duration:** 10–60 seconds typical (progress reported via MCP notifications)
- **Errors:** no mesh loaded, invalid weights, invalid method

---

## Example Conversation

```
User: I have a dental implant at /home/doctor/case42.stl. Please load it
       and find the optimal CT scan orientation with equal weights.

Claude: [calls load_mesh(path="/home/doctor/case42.stl")]
        → 142,000 triangles, watertight ✓, extent 50.6×37.4×24.2mm

        The mesh loaded successfully. It's a watertight part with 142K triangles.
        Now running the optimization...

        [calls run_optimization(weights=[0.2,0.2,0.2,0.2,0.2], method="weighted")]
        → Best: θ = -15°, φ = 8°
        → Score: 0.032 (lower = better)
        → Max penetration: 45.7mm
        → Completed in 14.2 seconds

        ## Results

        **Optimal orientation:** θ = -15°, φ = 8°
        - Generalized mean penetration (fMtl): 12.34 mm
        - Max penetration (fEnergy): 45.67 mm
        - Projection uniformity (fHdn): 3.21 mm
        - Tuy completeness (fTuy): 0.05 (1.0 = perfect)
        - Combined score: 0.032

        **Runner-up:** θ = 30°, φ = -15° (score: 0.041)

        **Reference** (θ=0°, φ=0°): score 0.51 — the optimal is 16× better.

        The optimum is well inside the search range (no boundary warning).
        Top 3 orientations span 18° — well-converged.

        Would you like me to evaluate a specific orientation, or try different
        weight settings?
```

---

## Objective Functions (for context)

| Metric | What it measures |
|---|---|
| **fMtl** | Generalized-mean penetration path length (mm). Lower = less material to penetrate. |
| **fEnergy** | Maximum path length across all rays (mm). Determines required tube voltage. |
| **fHdn** | Range of max path lengths across projections. Lower = more uniform ray coverage. |
| **fTuy** | Tuy-Smith completeness fraction. Higher = fewer reconstruction artifacts. |
| **fBh** | Beam-hardening proxy (placeholder, currently 0). |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Tools not found" error in Claude | MCP server not started or crashed | Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log` (macOS) |
| "file not found" from `load_mesh` | Claude Desktop sandbox restricts file access | Use absolute paths. On macOS, grant Claude Desktop "Full Disk Access" in System Settings → Privacy & Security |
| Permission denied running binary | Execute bit not set | `chmod +x /path/to/penopt-mcp` |
| "Connection refused" | Binary path wrong in config | Verify the path with `which penopt-mcp` or use an absolute path |
| Optimization slow | Large mesh or high ray grid | Reduce `rayGridXY` to 8 for faster results |
| `method` must be "weighted" or "minimax" | Typo in weight method | Use exact string `"weighted"` or `"minimax"` |

### Checking MCP Logs (macOS)

```bash
tail -f ~/Library/Logs/Claude/mcp-server-penopt.log
```

---

## Building from Source

```bash
# From the PenOpt project root:
go build -o penopt-mcp ./cmd/penopt-mcp
```

No dependencies beyond Go 1.25+ are required — no Node.js, no Wails, no webview libraries.

---

## Versioning

The MCP server version tracks the PenOpt GUI release version. Both are published together on the same [Releases page](https://github.com/donrami/PenOpt/releases).

---

## License

MIT — same as PenOpt.
