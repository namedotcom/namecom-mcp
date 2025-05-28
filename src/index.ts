#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_CONFIG } from "./config.js";
import { createToolsFromSpec, createFallbackTools } from "./tool-generator.js";

/**
 * Initialize and start the Name.com MCP server
 */
async function main(): Promise<void> {
  // Create MCP server
  const server = new McpServer(SERVER_CONFIG);
  
  // Try to create tools from OpenAPI spec
  const success = await createToolsFromSpec(server);
  
  // Fallback to basic implementation if spec loading fails
  if (!success) {
    // Don't use console.warn as it interferes with MCP protocol
    createFallbackTools(server);
  }
  
  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Don't use console.log as it interferes with MCP protocol
}

// Start the server and handle any fatal errors
main().catch(error => {
  // Use stderr for error output to avoid interfering with MCP protocol on stdout
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});