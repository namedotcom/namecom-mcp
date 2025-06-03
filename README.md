# Name.com MCP Server (Experimental)

A Model Context Protocol (MCP) server that provides access to the Name.com API for domain management operations. This server automatically generates tools from the Name.com OpenAPI specification, allowing AI assistants to interact with domain registration, DNS management, and other Name.com services.

> **⚠️ Experimental Tool**: This MCP server is currently experimental and defaults to Name.com's test environment (`api.dev.name.com`). While you can configure it to use the production environment, we recommend using the test environment for initial experimentation.

## Feedback & Issues 🚀

**We want your feedback!** This is an experimental tool and we're actively seeking user input to improve it.

**[Share feedback, report bugs, or request features on GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues)** - your input helps us prioritize improvements and ensure this tool meets real-world needs. No feedback is too small!

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

The easiest way to get started - no building required!

```bash
npm install -g namecom-mcp
```

That's it! The package comes pre-compiled and ready to use.

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

**For Local Development** (if running from source):
```json
{
  "mcpServers": {
    "namecom": {
      "command": "node",
      "args": ["/path/to/your/namecom-mcp/dist/index.js"],
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
     - "What environment am I using?"
     - "I'm having trouble with authentication"
   - Claude will ask for permission each time it tries to use a tool
   - The conversation flow feels natural and intuitive
   - **No need to learn commands** - just describe what you want to do!

### Method 2: MCP Inspector (For Testing & Development)

The MCP Inspector is **excellent for testing and debugging** during development, but Claude Desktop is better for actual domain management tasks.

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

### Getting Help

The MCP server includes built-in help capabilities to assist you when things aren't working correctly:

#### 🆘 Getting Help & Guidance
Simply ask me in natural language:
- **"Help me with Name.com"** or **"I need help with domain management"**
- **"I'm having trouble with Name.com"** or **"Something isn't working"**
- **"Show me some examples"** or **"What can I do with this?"**
- **"What environment am I using?"** or **"Am I in test mode?"**

#### 🔗 Support & Issue Reporting
When you need to report problems or get official support:
- **"How do I report an issue?"** or **"Where can I get support?"**
- **"I want to request a feature"** or **"How do I give feedback?"**
- **"Where's the documentation?"** or **"Show me the API docs"**

#### 🌍 Environment & Status Checks
To understand your current setup:
- **"What environment am I using?"** - Check if you're in test or production mode
- **"Am I in test mode?"** - Verify safety for experimentation
- **"Is it safe to experiment?"** - Get recommendations for your current environment

#### 💡 The Key: Just Talk Naturally!
You don't need to memorize commands or tool names. Just describe what you want to do or what problem you're facing in plain English. The AI will:
- Understand your intent
- Use the appropriate tools behind the scenes
- Give you helpful information and guidance
- Connect you with the right support resources when needed

**These help capabilities work even if your API credentials aren't configured or if there are connection issues with Name.com's API!**

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

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify your `NAME_USERNAME` and `NAME_TOKEN` are correct
2. **API URL Issues**: The tool defaults to test environment (`api.dev.name.com`)
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

### Debug Mode

Set the environment variable `DEBUG=1` for verbose logging:

```bash
DEBUG=1 npx namecom-mcp
```

### Getting Help

If you run into issues:
1. Check the troubleshooting section above
2. Test with the MCP Inspector first to isolate configuration issues
3. Verify your credentials work with Name.com's API directly
4. Open an issue on GitHub with detailed error messages

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues)
- **Documentation**: See the [Name.com API Documentation](https://www.name.com/api-docs) for API details
- **MCP Protocol**: Learn more about [Model Context Protocol](https://modelcontextprotocol.io/)

## Changelog

See the [GitHub Releases](https://github.com/namedotcom/namecom-mcp/releases) page for version history and updates. 