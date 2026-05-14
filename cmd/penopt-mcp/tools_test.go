// Integration tests for MCP tools.
// Launches the penopt-mcp binary as a subprocess and exercises each tool
// over the MCP protocol using the official Go SDK client.
package main

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

// Test helper: starts the MCP server and returns a session.
func startMCPSession(t *testing.T) (*mcp.ClientSession, *mcp.Client) {
	t.Helper()
	ctx := context.Background()

	// Find the binary (at project root, two levels up from cmd/penopt-mcp/)
	wd, _ := os.Getwd()
	binary := filepath.Join(wd, "..", "..", "penopt-mcp")
	if _, err := os.Stat(binary); os.IsNotExist(err) {
		t.Skipf("penopt-mcp binary not found at %s; run 'go build -o penopt-mcp ./cmd/penopt-mcp' from project root", binary)
	}

	client := mcp.NewClient(&mcp.Implementation{Name: "test", Version: "1.0"}, nil)
	cmd := exec.Command(binary)
	transport := &mcp.CommandTransport{Command: cmd}
	session, err := client.Connect(ctx, transport, nil)
	if err != nil {
		t.Fatalf("Connect: %v", err)
	}
	return session, client
}

func TestTools_ListTools(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	tools, err := session.ListTools(context.Background(), nil)
	if err != nil {
		t.Fatalf("ListTools: %v", err)
	}

	expected := map[string]bool{
		"ping":                  false,
		"load_mesh":             false,
		"get_mesh_info":         false,
		"evaluate_orientation":  false,
		"run_optimization":      false,
	}
	for _, tool := range tools.Tools {
		if _, ok := expected[tool.Name]; ok {
			expected[tool.Name] = true
		} else {
			t.Errorf("unexpected tool: %s", tool.Name)
		}
	}
	for name, found := range expected {
		if !found {
			t.Errorf("missing tool: %s", name)
		}
	}
}

func TestTools_Ping(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name:      "ping",
		Arguments: map[string]any{},
	})
	if err != nil {
		t.Fatalf("CallTool(ping): %v", err)
	}
	if result.IsError {
		t.Fatal("ping returned isError=true")
	}
}

func TestTools_LoadMesh_Success(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	meshPath, _ := filepath.Abs(filepath.Join("testdata", "cube20.stl"))

	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "load_mesh",
		Arguments: map[string]any{
			"path": meshPath,
		},
	})
	if err != nil {
		t.Fatalf("CallTool(load_mesh): %v", err)
	}
	if result.IsError {
		t.Fatal("load_mesh returned isError=true")
	}
	// Extract JSON output
	content := extractTextContent(t, result)
	t.Logf("load_mesh result: %s", content)
	if content == "" {
		t.Fatal("load_mesh returned empty content")
	}
}

func TestTools_LoadMesh_FileNotFound(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "load_mesh",
		Arguments: map[string]any{
			"path": "/nonexistent/path.stl",
		},
	})
	if err != nil {
		t.Fatalf("CallTool(load_mesh): %v", err)
	}
	if !result.IsError {
		t.Fatal("load_mesh should have returned isError=true for nonexistent path")
	}
	content := extractTextContent(t, result)
	t.Logf("load_mesh error: %s", content)
}

func TestTools_LoadMesh_BadExtension(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "load_mesh",
		Arguments: map[string]any{
			"path": "/tmp/test.fbx",
		},
	})
	if err != nil {
		t.Fatalf("CallTool(load_mesh): %v", err)
	}
	if !result.IsError {
		t.Fatal("load_mesh should have returned isError=true for unsupported format")
	}
}

func TestTools_GetMeshInfo_NoMesh(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name:      "get_mesh_info",
		Arguments: map[string]any{},
	})
	if err != nil {
		t.Fatalf("CallTool(get_mesh_info): %v", err)
	}
	if !result.IsError {
		t.Fatal("get_mesh_info should have returned isError=true when no mesh is loaded")
	}
}

func TestTools_GetMeshInfo_AfterLoad(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	meshPath, _ := filepath.Abs(filepath.Join("testdata", "cube20.stl"))

	// Load mesh
	_, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "load_mesh",
		Arguments: map[string]any{"path": meshPath},
	})
	if err != nil {
		t.Fatalf("load_mesh failed: %v", err)
	}

	// Get mesh info
	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name:      "get_mesh_info",
		Arguments: map[string]any{},
	})
	if err != nil {
		t.Fatalf("CallTool(get_mesh_info): %v", err)
	}
	if result.IsError {
		t.Fatal("get_mesh_info returned isError=true after loading mesh")
	}
	content := extractTextContent(t, result)
	t.Logf("get_mesh_info result: %s", content)
}

func TestTools_EvaluateOrientation(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	meshPath, _ := filepath.Abs(filepath.Join("testdata", "cube20.stl"))

	// Load mesh first
	_, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "load_mesh",
		Arguments: map[string]any{"path": meshPath},
	})
	if err != nil {
		t.Fatalf("load_mesh failed: %v", err)
	}

	// Evaluate at origin
	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "evaluate_orientation",
		Arguments: map[string]any{
			"theta": float64(0),
			"phi":   float64(0),
		},
	})
	if err != nil {
		t.Fatalf("CallTool(evaluate_orientation): %v", err)
	}
	if result.IsError {
		t.Fatal("evaluate_orientation returned isError=true")
	}
	content := extractTextContent(t, result)
	t.Logf("evaluate_orientation(0,0) result: %s", content)
}

func TestTools_EvaluateOrientation_NoMesh(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "evaluate_orientation",
		Arguments: map[string]any{
			"theta": float64(0),
			"phi":   float64(0),
		},
	})
	if err != nil {
		t.Fatalf("CallTool(evaluate_orientation): %v", err)
	}
	if !result.IsError {
		t.Fatal("evaluate_orientation should have returned isError=true with no mesh loaded")
	}
}

func TestTools_RunOptimization(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	meshPath, _ := filepath.Abs(filepath.Join("testdata", "cube20.stl"))

	// Load mesh first
	_, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "load_mesh",
		Arguments: map[string]any{"path": meshPath},
	})
	if err != nil {
		t.Fatalf("load_mesh failed: %v", err)
	}

	// Run optimization with defaults
	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "run_optimization",
		Arguments: map[string]any{
			"weights":     [5]float64{0.2, 0.2, 0.2, 0.2, 0.2},
			"method":      "weighted",
			"rayGridXY":   float64(0),
			"searchRange": float64(0),
		},
	})
	if err != nil {
		t.Fatalf("CallTool(run_optimization): %v", err)
	}
	if result.IsError {
		t.Fatal("run_optimization returned isError=true")
	}
	content := extractTextContent(t, result)
	t.Logf("run_optimization result: %s", content)
}

func TestTools_RunOptimization_NoMesh(t *testing.T) {
	session, _ := startMCPSession(t)
	defer session.Close()

	result, err := session.CallTool(context.Background(), &mcp.CallToolParams{
		Name: "run_optimization",
		Arguments: map[string]any{
			"weights": [5]float64{0.2, 0.2, 0.2, 0.2, 0.2},
		},
	})
	if err != nil {
		t.Fatalf("CallTool(run_optimization): %v", err)
	}
	if !result.IsError {
		t.Fatal("run_optimization should have returned isError=true with no mesh loaded")
	}
}

// ── Helpers ──

func extractTextContent(t *testing.T, result *mcp.CallToolResult) string {
	t.Helper()
	for _, c := range result.Content {
		if tc, ok := c.(*mcp.TextContent); ok {
			return tc.Text
		}
	}
	return ""
}
