# Name.com MCP Server (Experimental)

[![npm version](https://img.shields.io/npm/v/namecom-mcp.svg)](https://www.npmjs.com/package/namecom-mcp)
[![npm downloads](https://img.shields.io/npm/dm/namecom-mcp.svg)](https://www.npmjs.com/package/namecom-mcp)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP Server](https://img.shields.io/badge/MCP-Server-orange.svg)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that provides access to the Name.com API for domain management operations. This server automatically generates tools from the Name.com OpenAPI specification, allowing AI assistants to interact with domain registration, DNS management, and other Name.com services.

> **⚠️ Experimental Tool**: This MCP server is currently experimental and defaults to Name.com's test environment (`mcp.dev.name.com`). While you can configure it to use the production environment, we recommend using the test environment for initial experimentation.

## Best Way to Use This Tool

**Claude Desktop is the recommended way to use this MCP server.** It provides the most seamless experience for domain management tasks through natural conversation. The MCP Inspector is excellent for testing and debugging during development, and many other AI tools are announcing MCP support soon, which will expand the ways you can use this server!

## Features

- 🔄 **Dynamic Tool Generation**: Automatically creates MCP tools from Name.com's OpenAPI specification
- 🛡️ **Secure Authentication**: Uses Name.com API credentials with proper authentication
- 📝 **Comprehensive API Coverage**: Supports all Name.com API endpoints including domains, DNS, and more
- 🔧 **Flexible Configuration**: Simple integration with AI tools like Claude Desktop or local development
- 📊 **Rich Parameter Support**: Handles complex nested objects, arrays, and all parameter types
- 🚨 **Error Handling**: Robust error handling with informative error messages
- 🧪 **Test Environment**: Defaults to safe test environment for experimentation
- 🤖 **AI-First Design**: Built specifically for AI assistant integration via Model Context Protocol

## Installation

### Prerequisites

- **Node.js**: Version 17 or higher ([download here](https://nodejs.org/))
- **Name.com Account**: [Sign up for free](https://www.name.com/)
- **API Credentials**: Generated from your Name.com account dashboard
- **Claude Desktop**: [Download from Anthropic](https://claude.ai/download) (recommended)

### Getting Name.com API Credentials

You'll need Name.com API credentials:

1. Log in to your Name.com account
2. Go to Account Settings > API Tokens
3. Generate an API token
4. Note your username and the generated token
5. Make sure you are using the correct credentials for your configured environment (dev vs prod)

### Quick Start (Recommended)

The easiest way to get started - no building required!

```bash
npm install -g namecom-mcp
```

That's it! The package comes pre-compiled and ready to use. Follow configuration for next steps.

## 🚀 Quick Example

After installation and configuration, you can immediately start using natural language:

**Ask Claude:**
> "Can you search for available domains with 'myawesomeproject' in the name?"

**Claude will:**
1. Ask permission to use the domain search tool
2. Search Name.com's test environment safely
3. Show you available options with pricing
4. Help you register if you want (in test mode)

## Configuration

### Claude Desktop Setup (Recommended)

Add the following to your Claude Desktop configuration file. Default Claude config location:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

If you cannot locate this file through your filesystem, you can access it through Claude Desktop Settings → Developer → Edit Config

**For npm installation (Recommended):**
```json
{
  "mcpServers": {
    "namecom": {
      "command": "npx",
      "args": ["namecom-mcp"],
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
    "namecom": {
      "command": "npx",
      "args": ["namecom-mcp"],
      "env": {
        "NAME_USERNAME": "your-name-com-username",
        "NAME_TOKEN": "your-name-com-api-token",
        "NAME_API_URL": "https://mcp.name.com"
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
# Defaults to test environment - uncomment and modify for production (advanced):
# NAME_API_URL=https://mcp.name.com
```

## System Requirements

- **Node.js**: ≥17.0.0
- **npm**: ≥8.0.0  
- **Operating Systems**: macOS, Linux, Windows
- **Claude Desktop**: Latest version recommended
- **Network**: Internet access for Name.com API

## Testing & Verification

### Method 1: Claude Desktop (Recommended for Daily Use)

**Claude Desktop provides the best experience** for using this MCP server. It's designed for natural conversation about domain management tasks.

1. **Install the package**:
   ```bash
   npm install -g namecom-mcp
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

### Method 2: MCP Inspector (Advanced For Testing & Debugging)

The MCP Inspector is **excellent for testing and debugging**, but Claude Desktop is better for actual domain management tasks.

1. **Install the MCP Inspector** (if not already installed):
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. **Run the Inspector**:
   ```bash
   # For NPM installation:
   npx @modelcontextprotocol/inspector npx namecom-mcp
   
   # For local development:
   npx @modelcontextprotocol/inspector node "/path/to/your/namecom-mcp/dist/index.js"
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

## Available Tools

Once configured, the MCP server will automatically generate tools for all available Name.com API endpoints.
The server dynamically generates tools based on the Name.com OpenAPI specification. Common tools include:

- `listDomains` - List domains in your account
- `getDomain` - Get details for a specific domain
- `searchDomains` - Search for available domains
- `createDnsRecord` - Create a new DNS record
- `listDnsRecords` - List DNS records for a domain
- `getAccountInfo` - Get account information
- And many more...

## Environment Information

- **Default Environment**: Test environment (`https://mcp.dev.name.com`)
- **Production Environment**: Available by setting `NAME_API_URL=https://mcp.name.com`
- **Safety**: Test environment operations won't affect real domains or incur charges

## Security Considerations

- **Never commit credentials**: Always use environment variables or Claude Desktop configuration
- **API Token Security**: Treat your Name.com API token like a password
- **Test Environment**: Default test environment provides safe experimentation
- **Least Privilege**: The server only accesses Name.com APIs with the permissions of your API token
- **Input Validation**: All inputs are validated using Zod schemas
- **Error Handling**: Errors are handled gracefully without exposing sensitive information


## Performance & Limits

- **API Rate Limits**: Respects Name.com's standard rate limits
- **Tool Generation**: ~2-3 seconds on first startup

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify your `NAME_USERNAME` and `NAME_TOKEN` are correct
2. **API URL Issues**: The tool defaults to test environment (`mcp.dev.name.com`)
3. **Tool Generation Fails**: The server will fall back to basic tools if OpenAPI spec loading fails
4. **Package Not Found**: 
   - Make sure you've installed the package: `npm install -g namecom-mcp`
   - Try reinstalling if you encounter issues: `npm uninstall -g namecom-mcp && npm install -g namecom-mcp`
5. **Claude Desktop Configuration Issues**:
   - Check your `claude_desktop_config.json` file path and syntax
   - Restart Claude Desktop after configuration changes
   - Verify the command is `npx` and args are `["namecom-mcp"]`
6. **MCP Inspector Connection Issues**:
   - For NPM installation, use: `npx @modelcontextprotocol/inspector npx namecom-mcp`
   - Check that your environment variables are set correctly

### npm Installation Issues

**"command not found: namecom-mcp"**
```bash
# Make sure global npm packages are in your PATH
npm config get prefix
# or reinstall globally
npm install -g namecom-mcp
```

**Permission denied errors**
```bash
# Use npx instead of global install
npx namecom-mcp
# or fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

### Getting Help

If you run into issues:
1. Check the troubleshooting section above
2. Test with the MCP Inspector first to isolate configuration issues
3. Verify your credentials work with Name.com's API directly
4. Open an issue on GitHub with detailed error messages

## FAQ

**Q: Can I use this with production domains?**
A: Yes, but it defaults to test environment. Set `NAME_API_URL=https://mcp.name.com` for production. **THIS WILL USE YOUR REAL NAME.COM ACCOUNT AND PAYMENT METHODS**

**Q: Does this work with other AI tools besides Claude?**
A: Not yet. More integrations coming soon.

**Q: How much does it cost to use?**
A: The MCP server is free. You only pay for actual Name.com services you use.

**Q: Is it safe to test?**
A: Yes! Default test environment won't affect real domains or billing.

**Q: Can I run multiple instances?**
A: Yes, but each instance should use different credentials to avoid conflicts.

**Q: Does it work offline?**
A: No, it requires internet access to communicate with Name.com's API.


## MCP Ecosystem

This server is part of the growing MCP ecosystem:

- **[MCP Inspector](https://github.com/modelcontextprotocol/inspector)**: Debug and test MCP servers
- **[MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)**: Build your own MCP servers

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues)
- **Documentation**: See the [Name.com API Documentation](https://docs.name.com) for API details
- **MCP Protocol**: Learn more about [Model Context Protocol](https://modelcontextprotocol.io/)

## Changelog

See the [GitHub Releases](https://github.com/namedotcom/namecom-mcp/releases) page for version history and updates. 