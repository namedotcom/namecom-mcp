# Name.com MCP Server (Experimental)

A Model Context Protocol (MCP) server that provides access to the Name.com API for domain management operations. This server automatically generates tools from the Name.com OpenAPI specification, allowing AI assistants to interact with domain registration, DNS management, and other Name.com services.

> **⚠️ Experimental Tool**: This MCP server is currently experimental and defaults to Name.com's test environment (`api.dev.name.com`). While you can configure it to use the production environment, we recommend using the test environment for initial experimentation.

## Best Way to Use This Tool

**Claude Desktop is the recommended way to use this MCP server.** It provides the most seamless experience for domain management tasks through natural conversation. The MCP Inspector is excellent for testing and debugging during development, and many other AI tools are announcing MCP support soon, which will expand the ways you can use this server!

## Features

- 🔄 **Dynamic Tool Generation**: Automatically creates MCP tools from Name.com's OpenAPI specification
- 🛡️ **Secure Authentication**: Uses Name.com API credentials with proper authentication
- 📝 **Comprehensive API Coverage**: Supports all Name.com API endpoints including domains, DNS, SSL certificates, and more
- 🔧 **Flexible Configuration**: Easy setup through environment variables or Claude Desktop configuration
- 📊 **Rich Parameter Support**: Handles complex nested objects, arrays, and all parameter types
- 🚨 **Error Handling**: Robust error handling with informative error messages
- 🧪 **Test Environment**: Defaults to safe test environment for experimentation
- 🤖 **AI-First Design**: Built specifically for AI assistant integration via Model Context Protocol

## Installation

### Quick Start (Recommended)

The easiest way to get started - no building required!

```bash
npm install -g name-com-mcp
```

That's it! The package comes pre-compiled and ready to use.

### From Source (For Development)

Only needed if you want to modify the code:

```bash
git clone https://github.com/yourusername/name-com-mcp.git
cd name-com-mcp
npm install
npm run build
```

## Configuration

### Prerequisites

You'll need Name.com API credentials:

1. Log in to your Name.com account
2. Go to Account Settings > API Access
3. Generate an API token
4. Note your username and the generated token

### Claude Desktop Setup (Recommended)

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "name-com": {
      "command": "npx",
      "args": ["name-com-mcp"],
      "env": {
        "NAME_USERNAME": "your-name-com-username",
        "NAME_TOKEN": "your-name-com-api-token"
      }
    }
  }
}
```

**For Local Development** (if running from source):
```json
{
  "mcpServers": {
    "name-com": {
      "command": "node",
      "args": ["/path/to/your/name-com-mcp/dist/index.js"],
      "env": {
        "NAME_USERNAME": "your-name-com-username",
        "NAME_TOKEN": "your-name-com-api-token"
      }
    }
  }
}
```

**For Production Environment** (advanced users):
```json
{
  "mcpServers": {
    "name-com": {
      "command": "npx",
      "args": ["name-com-mcp"],
      "env": {
        "NAME_USERNAME": "your-name-com-username",
        "NAME_TOKEN": "your-name-com-api-token",
        "NAME_API_URL": "https://api.name.com"
      }
    }
  }
}
```

### Alternative: Environment Variables

If you prefer environment variables, create a `.env` file:

```env
NAME_USERNAME=your-name-com-username
NAME_TOKEN=your-name-com-api-token
# Defaults to test environment - uncomment and modify for production:
# NAME_API_URL=https://api.name.com
```

## Testing & Verification

### Method 1: Claude Desktop (Recommended for Daily Use)

**Claude Desktop provides the best experience** for using this MCP server. It's designed for natural conversation about domain management tasks.

1. **Install the package**:
   ```bash
   npm install -g name-com-mcp
   ```

2. **Configure Claude Desktop** (see Configuration section above)

3. **Start Claude Desktop**:

4. **Start using it naturally**:
   - Ask Claude domain-related questions like:
     - "Can you list my domains?"
     - "Search for available domains with the name 'example'"
     - "Show me the DNS records for my domain"
     - "Help me register a new domain"
   - Claude will ask for permission each time it tries to use a tool
   - The conversation flow feels natural and intuitive

### Method 2: MCP Inspector (For Testing & Development)

The MCP Inspector is **excellent for testing and debugging** during development, but Claude Desktop is better for actual domain management tasks.

1. **Install the MCP Inspector** (if not already installed):
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. **Run the Inspector**:
   ```bash
   # For NPM installation:
   npx @modelcontextprotocol/inspector npx name-com-mcp
   
   # For local development:
   npx @modelcontextprotocol/inspector node "/path/to/your/name-com-mcp/dist/index.js"
   ```

3. **Open the Inspector**:
   - The command will output a local URL (usually `http://localhost:5173`)
   - Open this URL in your browser

4. **Test the Connection**:
   - Click "Connect" in the left sidebar
   - Make sure your setup shows the correct command and arguments
   - Once connected, click "List Tools" in the center
   - Select any tool to test that the endpoints are working through the MCP server

### Future: More AI Tools Coming Soon!

Many other AI tools and platforms are announcing MCP support, which means this Name.com server will work with an expanding ecosystem of AI assistants. Stay tuned for more integration options!

## Usage

Once configured, the MCP server will automatically generate tools for all available Name.com API endpoints. Here are some example operations you can perform:

### Domain Management
- Search for available domains
- Register new domains (test environment safe)
- Renew existing domains
- Transfer domains
- Update domain contacts

### DNS Management
- List DNS records
- Create, update, and delete DNS records
- Manage nameservers

### SSL Certificates
- Purchase SSL certificates
- Manage certificate lifecycle

### Account Management
- View account information
- Check domain and service pricing

## Available Tools

The server dynamically generates tools based on the Name.com OpenAPI specification. Common tools include:

- `listDomains` - List domains in your account
- `getDomain` - Get details for a specific domain
- `searchDomains` - Search for available domains
- `createDnsRecord` - Create a new DNS record
- `listDnsRecords` - List DNS records for a domain
- `getAccountInfo` - Get account information
- And many more...

## Environment Information

- **Default Environment**: Test environment (`https://api.dev.name.com`)
- **Production Environment**: Available by setting `NAME_API_URL=https://api.name.com`
- **Safety**: Test environment operations won't affect real domains or incur charges

## Security Considerations

- **Never commit credentials**: Always use environment variables or Claude Desktop configuration
- **API Token Security**: Treat your Name.com API token like a password
- **Test Environment**: Default test environment provides safe experimentation
- **Least Privilege**: The server only accesses Name.com APIs with the permissions of your API token
- **Input Validation**: All inputs are validated using Zod schemas
- **Error Handling**: Errors are handled gracefully without exposing sensitive information

## Development

### For Contributors and Developers

Building from source is only needed if you want to modify the code or contribute to the project.

```bash
git clone https://github.com/yourusername/name-com-mcp.git
cd name-com-mcp
npm install
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

### Project Structure

```
src/
├── index.ts           # Main entry point
├── config.ts          # Configuration and environment variables
├── api-client.ts      # Name.com API client
├── tool-generator.ts  # Dynamic tool generation from OpenAPI spec
├── openapi-utils.ts   # OpenAPI specification utilities
└── types.ts           # TypeScript type definitions
```

### Publishing

The package is automatically built before publishing thanks to the `prepublishOnly` script. The published package includes the compiled `dist` directory, so users don't need to build anything.

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify your `NAME_USERNAME` and `NAME_TOKEN` are correct
2. **API URL Issues**: The tool defaults to test environment (`api.dev.name.com`)
3. **Tool Generation Fails**: The server will fall back to basic tools if OpenAPI spec loading fails
4. **Package Not Found**: 
   - Make sure you've installed the package: `npm install -g name-com-mcp`
   - Try reinstalling if you encounter issues: `npm uninstall -g name-com-mcp && npm install -g name-com-mcp`
5. **Claude Desktop Configuration Issues**:
   - Check your `claude_desktop_config.json` file path and syntax
   - Restart Claude Desktop after configuration changes
   - Verify the command is `npx` and args are `["name-com-mcp"]`
6. **MCP Inspector Connection Issues**:
   - For NPM installation, use: `npx @modelcontextprotocol/inspector npx name-com-mcp`
   - Check that your environment variables are set correctly

### Debug Mode

Set the environment variable `DEBUG=1` for verbose logging:

```bash
DEBUG=1 npx name-com-mcp
```

### Getting Help

If you run into issues:
1. Check the troubleshooting section above
2. Test with the MCP Inspector first to isolate configuration issues
3. Verify your credentials work with Name.com's API directly
4. Open an issue on GitHub with detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/yourusername/name-com-mcp/issues)
- **Documentation**: See the [Name.com API Documentation](https://www.name.com/api-docs) for API details
- **MCP Protocol**: Learn more about [Model Context Protocol](https://modelcontextprotocol.io/)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates. 