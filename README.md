# MCP REST

A REST API wrapper around the Model Context Protocol (MCP) client.

This is so you can play around with MCP without having to have a constant
connection up and running.

Just for testing, not to use for real.

## Installation

```bash
# Install globally
npm install -g mcp-rest

# Or use with npx
npx mcp-rest
```

## Usage

```bash
npx mcp-rest [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --type <type>` | Connection type: "sse"| sse |
| `-u, --url <url>` | SSE server URL (for sse type) | http://localhost:8000/sse |
| `-p, --port <port>` | Express server port | 3000 |
| `-d, --debug` | Enable debug logging | false |
| `-h, --help` | Display help | |
| `-V, --version` | Display version | |

## Examples

### SSE Mode

```bash
# Connect to SSE server at default URL
npx mcp-rest

# Connect to custom SSE server and port
npx mcp-rest --type sse --url http://localhost:9000/sse --port 4000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Check connection status |
| `/tools` | GET | List all available tools |
| `/tools/:toolId` | POST | Call a specific tool with arguments |

### Example API Usage

```bash
# Get connection status
curl http://localhost:3000/status

# List all available tools
curl http://localhost:3000/tools

# Call a tool
curl -X POST http://localhost:3000/tools/exampleTool \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"param1": "value1"}}'
```

## Troubleshooting

If you encounter connection issues:

1. Use the `--debug` flag to see detailed logs
2. Check the `/status` endpoint to verify connection status
3. Ensure your MCP server/process is running and accessible

## License

MIT
