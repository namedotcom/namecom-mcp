# Name.com MCP Server (Experimental)

[![npm version](https://img.shields.io/npm/v/namecom-mcp.svg)](https://www.npmjs.com/package/namecom-mcp)
[![npm downloads](https://img.shields.io/npm/dm/namecom-mcp.svg)](https://www.npmjs.com/package/namecom-mcp)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP Server](https://img.shields.io/badge/MCP-Server-orange.svg)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that provides access to the Name.com API for domain management operations. This server automatically generates tools from the Name.com OpenAPI specification, allowing AI assistants to interact with domain registration, DNS management, and other Name.com services.

> **⚠️ Experimental Tool**: This MCP server is currently experimental and defaults to Name.com's test environment (`mcp.dev.name.com`). While you can configure it to use the production environment, we recommend using the test environment for initial experimentation.

## How to Use This Tool

This MCP server works with **any AI tool that supports the Model Context Protocol (MCP)**. You can use it for domain management tasks through natural conversation with your preferred AI assistant. The MCP Inspector is excellent for testing and troubleshooting your setup.

## Features

- 🔄 **Dynamic Tool Generation**: Automatically creates MCP tools from Name.com's OpenAPI specification
- 🛡️ **Secure Authentication**: Uses Name.com API credentials with proper authentication
- 📝 **Comprehensive API Coverage**: Supports all Name.com API endpoints including domains, DNS, and more
- 🔧 **Flexible Configuration**: Simple integration with AI tools that support MCP
- 📊 **Rich Parameter Support**: Handles complex nested objects, arrays, and all parameter types
- 🚨 **Error Handling**: Robust error handling with informative error messages
- 🧪 **Test Environment**: Defaults to safe test environment for experimentation
- 🤖 **AI-First Design**: Built specifically for AI assistant integration via Model Context Protocol

## Installation

### Prerequisites

- **Node.js**: Version 17 or higher ([download here](https://nodejs.org/))
- **Name.com Account**: [Sign up for free](https://www.name.com/)
- **API Credentials**: Generated from your Name.com account dashboard
- **MCP-Compatible AI Tool**: Such as Claude Desktop, or any other tool with MCP support

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

Configure the Name.com MCP server with your AI tool by providing the following:

- **Command**: `namecom-mcp`
- **Required Environment Variables**:
  - `NAME_USERNAME`: Your Name.com API token username
  - `NAME_TOKEN`: Your Name.com API token
- **Optional Environment Variables**:
  - `NAME_API_URL`: API endpoint (`https://mcp.dev.name.com` for test, `https://mcp.name.com` for production)

### MCP Configuration

Add the following configuration to your MCP-compatible AI tool's config file:

```json
{
  "mcpServers": {
    "namecom": {
      "command": "namecom-mcp",
      "env": {
        "NAME_USERNAME": "your-name-com-username",
        "NAME_TOKEN": "your-name-com-api-token"
      }
    }
  }
}
```

**MCP Configuration Resources:**

| Tool | Configuration Guide |
|------|-------------------|
| **Cursor** | Follow the [official Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol) |
| **Claude Desktop** | Follow the [official Claude Desktop MCP setup guide](https://modelcontextprotocol.io/quickstart/user) |
| **Other MCP tools** | Refer to your tool's official MCP documentation |

> 💡 **Tip**: Each tool may have slightly different configuration steps and UI. Always refer to the official documentation for the most up-to-date and accurate instructions.

**Popular MCP-Compatible Tools:**
- [Claude Desktop](https://claude.ai/download) - Natural conversation interface
- [Cursor](https://cursor.sh/) - AI-powered code editor with MCP integration
- [Continue](https://github.com/continuedev/continue) - VS Code extension with MCP support
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - Testing and troubleshooting
- Many more tools are adding MCP support regularly

### Environment Variables (Alternative Setup)

If your tool doesn't support inline environment configuration, create a `.env` file:

```env
NAME_USERNAME=your-name-com-username
NAME_TOKEN=your-name-com-api-token
# Defaults to test environment - uncomment for production (advanced):
# NAME_API_URL=https://mcp.name.com
```

## System Requirements

- **Node.js**: ≥17.0.0
- **npm**: ≥8.0.0  
- **Operating Systems**: macOS, Linux, Windows
- **AI Tool (Cursor, Claude Desktop, etc)**: Latest version recommended
- **Network**: Internet access for Name.com API

## Testing & Verification

### Using with Your AI Tool

1. **Install the package**:
   ```bash
   npm install -g namecom-mcp
   ```

2. **Configure your AI tool** (see Configuration section above)

3. **Start your AI tool and begin using it naturally**:
   - Ask domain-related questions like:
     - "Can you list my domains?"
     - "Search for available domains with the name 'example'"
     - "Show me the DNS records for my domain"
     - "Help me register a new domain"
   - Your AI tool will request permission to use Name.com tools
   - The conversation flow feels natural and intuitive

### MCP Inspector (Testing & Troubleshooting)

The MCP Inspector is **excellent for testing and troubleshooting** your MCP server setup before using it with your preferred AI tool.

1. **Install the MCP Inspector** (if not already installed):
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. **Run the Inspector with your credentials**:
   ```bash
   NAME_USERNAME=your-name-com-username NAME_TOKEN=your-name-com-api-token npx @modelcontextprotocol/inspector namecom-mcp
   ```

   **For production environment** (advanced):
   ```bash
   NAME_USERNAME=your-username NAME_TOKEN=your-token NAME_API_URL=https://mcp.name.com npx @modelcontextprotocol/inspector namecom-mcp
   ```

3. **Open the Inspector**:
   - The command will output a local URL with an auth token (e.g., `http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=...`)
   - Open this URL in your browser

4. **Test the Connection**:
   - Click "Connect" in the left sidebar
   - Once connected, click "List Tools" in the center to see all available Name.com API tools
   - Select any tool to test that the endpoints are working through the MCP server

### Growing MCP Ecosystem

The Model Context Protocol is rapidly gaining adoption across the AI tool ecosystem. This Name.com server works with any MCP-compatible tool, giving you flexibility in choosing your preferred AI assistant for domain management tasks.

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

### Getting Help

The server includes built-in help tools that your AI assistant can access to provide immediate support.

**Need help?** Simply ask your AI assistant:
- "How can I get help with Name.com?"
- "I'm having issues, can you show me troubleshooting tips?"
- "Where can I report a problem or request a feature?"

Your AI assistant will automatically use the appropriate help tools to provide documentation links, troubleshooting guidance, and support resources.

## Environment Information

- **Default Environment**: Test environment (`https://mcp.dev.name.com`)
- **Production Environment**: Available by setting `NAME_API_URL=https://mcp.name.com`
- **Safety**: Test environment operations won't affect real domains or incur charges

> ⚠️ **PRODUCTION ENVIRONMENT WARNING**: When using the production environment (`NAME_API_URL=https://mcp.name.com`), all operations will affect your real Name.com account, real domains, and use real payment methods. Domain registrations will incur real charges. Always test in the default test environment first.

## Security Considerations

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
5. **MCP Configuration Issues**:
   - Check your MCP config file path and JSON syntax (see Configuration section for file locations)
   - Restart your AI tool after configuration changes
   - Verify the command is `namecom-mcp` (no npx needed)
6. **MCP Inspector Connection Issues**:
   - Make sure to include your credentials: `NAME_USERNAME=your-username NAME_TOKEN=your-token npx @modelcontextprotocol/inspector namecom-mcp`
   - Check that your credentials are correct and match your configured environment (test vs production)

### npm Installation Issues

For npm installation or permission issues, see the official documentation:
- **[npm global package installation](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)**
- **[Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)** - recommended for avoiding permission issues

### Getting Help

If you run into issues:
1. Check the troubleshooting section above
2. Test with the MCP Inspector first to isolate configuration issues
3. Verify your credentials work with Name.com's API directly
4. Open an issue on GitHub with detailed error messages

## FAQ

**Q: Can I use this with production domains?**
A: Yes, but it defaults to test environment. Set `NAME_API_URL=https://mcp.name.com` for production. **THIS WILL USE YOUR REAL NAME.COM ACCOUNT AND PAYMENT METHODS**

**Q: What AI tools does this work with?**
A: This MCP server works with any tool that supports the Model Context Protocol, including Claude Desktop, Cursor, and many others.

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