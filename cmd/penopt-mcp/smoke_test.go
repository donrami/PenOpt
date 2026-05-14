// Integration test: connects to the penopt-mcp binary and exercises the protocol.
package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

func TestMCPServerSmoke(t *testing.T) {
	ctx := context.Background()

	// The binary is at the project root (two levels up from cmd/penopt-mcp/)
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
	defer session.Close()

	// List tools
	tools, err := session.ListTools(ctx, nil)
	if err != nil {
		t.Fatalf("ListTools: %v", err)
	}
	if len(tools.Tools) == 0 {
		t.Fatal("expected at least 1 tool")
	}
	fmt.Printf("Found %d tool(s):\n", len(tools.Tools))
	for _, tool := range tools.Tools {
		fmt.Printf("  %s — %s\n", tool.Name, tool.Description)
	}

	// Call ping
	result, err := session.CallTool(ctx, &mcp.CallToolParams{
		Name:      "ping",
		Arguments: map[string]any{},
	})
	if err != nil {
		t.Fatalf("CallTool(ping): %v", err)
	}
	if result.IsError {
		t.Fatal("ping returned isError=true")
	}
	if len(result.Content) == 0 {
		t.Fatal("ping returned no content")
	}
	for _, c := range result.Content {
		if tc, ok := c.(*mcp.TextContent); ok {
			fmt.Printf("ping result: %s\n", tc.Text)
			if tc.Text == "" {
				t.Error("ping returned empty text")
			}
		}
	}
}
