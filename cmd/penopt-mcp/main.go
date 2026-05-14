// PenOpt MCP Server — headless binary for AI assistant integration.
//
// Provides Model Context Protocol (MCP) tools that let LLMs like Claude
// load 3D meshes, run CT orientation optimization, and inspect results.
// Communication is over stdin/stdout (stdio transport) — no network ports.
package main

import (
	"context"
	"log"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

// Version tracks the GUI release version. Update alongside main.Version.
const Version = "0.1.0"

// ── Ping Tool ────────────────────────────────────────────────────────────────

type PingInput struct{}

type PingOutput struct {
	Message string `json:"message"`
}

func handlePing(ctx context.Context, req *mcp.CallToolRequest, in PingInput) (
	*mcp.CallToolResult, PingOutput, error,
) {
	return nil, PingOutput{Message: "pong"}, nil
}

// ── Main ─────────────────────────────────────────────────────────────────────

func main() {
	server := mcp.NewServer(&mcp.Implementation{
		Name:    "penopt",
		Title:   "PenOpt CT Orientation Optimizer",
		Version: Version,
	}, nil)

	// Store global reference for tools that need to send notifications.
	mcpServer = server

	// ── Register tools ──

	mcp.AddTool(server, &mcp.Tool{
		Name:        "ping",
		Description: "Health check. Returns 'pong' if the MCP server is running and ready to accept tool calls.",
	}, handlePing)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "load_mesh",
		Description: "Load a 3D triangle mesh from an STL or OBJ file. Parses the mesh, centers it at the origin, and builds a BVH acceleration structure for ray casting. Returns mesh metadata including triangle count, watertightness, bounding box, and extent. Use this first — optimization tools require a loaded mesh.",
	}, handleLoadMesh)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "get_mesh_info",
		Description: "Get metadata about the currently loaded mesh: triangle/vertex count, watertightness, bounding box, center, and extent. Does not reload the mesh. Returns an error if no mesh has been loaded.",
	}, handleGetMeshInfo)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "evaluate_orientation",
		Description: "Evaluate a single CT scanning orientation (θ, φ) in degrees. Computes all 5 objective values (generalized mean penetration, max penetration, projection uniformity, Tuy completeness, beam hardening) and the combined score. Use this to preview a specific angle or explore the search space manually.",
	}, handleEvaluateOrientation)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "run_optimization",
		Description: "Run the full coarse→fine grid search to find the optimal CT scanning orientation. Evaluates orientations at 15° intervals (coarse), identifies the top 3 candidates, then refines at 1° resolution around them. Returns the best and worst orientations, convergence diagnostics, and warnings. Typical duration: 10–60 seconds. Progress is reported via MCP notifications.",
	}, handleRunOptimization)

	// ── Start server ──

	log.Println("PenOpt MCP server starting on stdio")
	if err := server.Run(context.Background(), &mcp.StdioTransport{}); err != nil {
		log.Fatal(err)
	}
}
