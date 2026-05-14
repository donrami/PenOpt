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

	mcp.AddTool(server, &mcp.Tool{
		Name:        "ping",
		Description: "Health check. Returns 'pong' if the MCP server is running and ready to accept tool calls.",
	}, handlePing)

	log.Println("PenOpt MCP server starting on stdio (pid", log.Prefix(), ")")
	if err := server.Run(context.Background(), &mcp.StdioTransport{}); err != nil {
		log.Fatal(err)
	}
}
