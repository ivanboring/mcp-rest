#!/usr/bin/env node

import { MCPClient } from "mcp-client";
import express from 'express';
import bodyParser from 'body-parser';
import { Command } from 'commander';

const program = new Command();

program
  .name('mcp-rest')
  .description('REST API wrapper around mcp-client')
  .version('1.0.0')
  .option('-t, --type <type>', 'connection type: "sse" or "stdio"', 'sse')
  .option('-u, --url <url>', 'SSE server URL (for sse type)', 'http://localhost:8000/sse')
  .option('-p, --port <port>', 'express server port', '3000')
  .option('-d, --debug', 'enable debug logging', false)
  .parse(process.argv);

const options = program.opts();
const debug = options.debug;

// Debug logging function
function log(...args) {
  if (debug) {
    console.log('[DEBUG]', ...args);
  }
}

// Start the REST API
async function startServer() {
  log('Starting MCP REST server with options:', options);

  const client = new MCPClient({
    name: "MCP-REST",
    version: "1.0.0",
  });

  // Parse JSON strings for args and env
  let args, env;
  try {
    args = options.args ? JSON.parse(options.args) : [];
    env = options.env ? JSON.parse(options.env) : {};
    log('Parsed args:', args);
    log('Parsed env:', env);
  } catch (error) {
    console.error('Error parsing JSON arguments or environment:', error);
    process.exit(1);
  }

  // Wait for connection to be established before starting the server
  try {
    log(`Connecting using ${options.type} mode...`);

    if (options.type === 'sse') {
      await client.connect({
        type: "sse",
        url: options.url,
      });
      console.log(`Connected to SSE server at: ${options.url}`);
    }

    // Test connection by getting tools
    log('Testing connection by getting available tools...');
    const tools = await client.getAllTools();
    log(`Successfully retrieved ${tools.length} tools`);

  } catch (error) {
    console.error(`Error connecting to ${options.type}:`, error);
    process.exit(1);
  }

  const app = express();
  const port = parseInt(options.port, 10);

  app.use(bodyParser.json());

  app.get('/tools', async (req, res) => {
    try {
      log('Getting all tools...');
      const tools = await client.getAllTools();
      log(`Returning ${tools.length} tools`);
      res.json({ tools });
    } catch (error) {
      console.error("Error getting tools:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/tools/:toolId', async (req, res) => {
    try {
      const toolId = req.params.toolId;
      const args = req.body.arguments;

      log(`Calling tool '${toolId}' with arguments:`, args);

      const result = await client.callTool({
        name: toolId,
        arguments: args,
      });

      log(`Tool '${toolId}' returned successfully`);
      res.json(result.content);
    } catch (error) {
      console.error("Error calling tool:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`MCP REST API server listening on port ${port}`);
    console.log(`Available endpoints:`);
    console.log(`  GET  /status        - Check connection status`);
    console.log(`  GET  /tools         - List all available tools`);
    console.log(`  POST /tools/:toolId - Call a specific tool with arguments`);
  });
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
