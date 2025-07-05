// mcp-server.ts

import express from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

// 1) Create your MCP server and register tools
const server = new McpServer({
  name:    "ClaudeDesktopEcho",
  version: "1.0.0",
});

// A simple `echo` tool: returns back whatever message is passed in
server.tool(
  "echo",
  z.object({ message: z.string() }),
  async ({ message }) => ({
    content: [{ type: "text", text: message }],
  })
);

  
// 2) Wire up HTTP endpoint that speaks MCP via SSE
const app = express();
app.use(express.json());

// Keep transports by session to support reconnects
const transports: Record<string, StreamableHTTPServerTransport> = {};

app.post("/mcp", (req, res) => {
  // Try to reuse an existing transport if session ID is provided
  let sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport = sessionId && transports[sessionId];

  // If this is the initial request, create a new transport
  if (!transport && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport!;
      },
    });

    // Clean up on close
    transport.onclose = () => {
      if (transport!.sessionId) {
        delete transports[transport!.sessionId];
      }
    };

    // Hook it up to your MCP server
    server.connect(transport);
  }

  if (!transport) {
    return res.status(400).send("Missing or invalid MCP initialization");
  }

  // Delegate this HTTP request/response to the MCP transport
  transport.handle(req, res);
});

// 3) Start listening
const PORT = 8810;
app.listen(PORT, () => {
  console.log(`🚀 MCP server for Claude Desktop running at http://localhost:${PORT}/mcp`);
});
