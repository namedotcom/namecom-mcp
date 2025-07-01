# name.com MCP Server

[![npm version](https://img.shields.io/npm/v/namecom-mcp.svg)](https://www.npmjs.com/package/namecom-mcp)
[![npm downloads](https://img.shields.io/npm/dm/namecom-mcp.svg)](https://www.npmjs.com/package/namecom-mcp)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP Server](https://img.shields.io/badge/MCP-Server-orange.svg)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that provides access to the complete name.com API for domain management operations. This server automatically generates tools from the name.com OpenAPI specification, giving AI assistants access to **all name.com API functions** including domain registration, DNS management, transfers, email forwarding, URL forwarding, and more.

> **⚠️ Experimental Tool**: This MCP server is currently experimental and defaults to name.com's test environment (`mcp.dev.name.com`) which requires **test environment credentials**. While you can configure it to use the production environment, we recommend using the test environment for initial experimentation.

This MCP server works with **any AI tool that supports the Model Context Protocol (MCP)**. You can use it for domain management tasks through natural conversation with your preferred AI assistant. The server dynamically creates tools for every available name.com API endpoint, so you have access to the full range of domain management capabilities.

## Features

- 🔄 **Complete API Access**: Dynamically creates tools for every name.com API endpoint
- 🛡️ **Secure Authentication**: Uses name.com API credentials with proper authentication
- 🔧 **Easy Integration**: Simple configuration with popular AI tools
- 🧪 **Safe Testing**: Defaults to test environment for experimentation
- 🤖 **AI-First Design**: Built specifically for natural language interaction via MCP
- 🆘 **Built-in Help**: Ask your AI assistant for help, troubleshooting, and documentation links

## Installation & Configuration

### Prerequisites

- **Node.js** 17+ and **npm** ([download here](https://nodejs.org/))
- **name.com Account** with API credentials ([sign up free](https://www.name.com/) | [help getting credentials](#getting-namecom-api-credentials))
- **MCP-Compatible AI Tool** (Cursor, Claude Desktop, etc.)

### Setup

**Step 1: Install the package**
```bash
npm install -g namecom-mcp
```

**Step 2: Choose your configuration method**

The `npm install` command installed the name.com MCP server on your computer. Now your AI tool needs to know where to find it and how to authenticate with name.com. Choose one of the following configuration methods:

#### Method A: Direct Configuration (Recommended)

This approach uses name.com's test environment by default. To get started, add the configuration below to your AI tool's MCP config file. Instructions for locating the MCP config files for a few common AI tools are provided after the configuration examples.

```json
{
  "mcpServers": {
    "namecom": {
      "command": "namecom-mcp",
      "env": {
        "NAME_USERNAME": "your-test-username",
        "NAME_TOKEN": "your-test-token"
      }
    }
  }
}
```

**For production environment** (advanced), add the API URL:
```json
{
  "mcpServers": {
    "namecom": {
      "command": "namecom-mcp",
      "env": {
        "NAME_USERNAME": "your-prod-username",
        "NAME_TOKEN": "your-prod-token",
        "NAME_API_URL": "https://mcp.name.com"
      }
    }
  }
}
```

> ⚠️ **Production Warning**: This will affect your real name.com account and may incur charges. See [Environment Details](#environment-details) for credential requirements.

**Important**: Use the right credentials for your environment - test credentials for test environment, production credentials for production.

**How to add this configuration to your tool:**

**Cursor:**
1. Open Cursor → Press **Cmd+Shift+J** (Mac) or **Ctrl+Shift+J** (Windows)
2. Go to **Tools & Integrations** → **MCP Tools** → **Add New**
3. Add the configuration above → Save and restart Cursor

**Claude Desktop:**
1. Open **Claude Desktop Settings** → **Developer** → **Edit Config**
2. Add the configuration above → Save and **restart Claude Desktop**

**Other MCP-Compatible Tools:**
This server is designed to work with any MCP-compatible tool. Check your tool's documentation for MCP configuration steps, as the exact process varies by tool.

> 📖 **Note**: The steps above may change as tools update. Please check the official documentation for Claude Desktop and Cursor if these steps don't match, and report any outdated instructions.

> 🔄 **Important**: Restart your AI tool after configuration changes if you experience connection issues.

#### Method B: Environment File

Use this method if:
- Your tool doesn't support the direct configuration above
- You prefer managing credentials in environment files
- You're developing or testing the server

Create a `.env` file in your working directory:
```env
# For test environment (default)
NAME_USERNAME=your-test-username
NAME_TOKEN=your-test-token

# For production environment (advanced)
# NAME_USERNAME=your-prod-username
# NAME_TOKEN=your-prod-token
# NAME_API_URL=https://mcp.name.com
```

**Important**: Make sure to use the correct credentials for your chosen environment - test credentials for test environment, production credentials for production environment.

**Step 3: You're done! 🎉**

Start your AI tool and begin asking domain-related questions. Your AI assistant will automatically use the name.com tools when needed.

### Understanding the Configuration

**What each setting does:**
- **`"namecom"`**: The name for this MCP server (you can change this)
- **`"command": "namecom-mcp"`**: Tells your AI tool to run the package you installed
- **`"NAME_USERNAME"`**: Your name.com API username (test credentials recommended)
- **`"NAME_TOKEN"`**: Your name.com API token (test credentials recommended)
- **Optional**: Add `"NAME_API_URL": "https://mcp.name.com"` for production environment

## ✅ Setup Complete - You're Ready to Go!

Congratulations! Your name.com MCP server is now configured and ready to use with your AI assistant.

### Quick Test
Start your AI tool and ask: **"Can you check if example.com is available?"**

If your AI assistant responds and searches for domains, you're all set! 🎉

**What you can do now:**
- Begin asking any domain-related questions in natural language
- Your AI assistant will automatically use the name.com tools when needed

## 🚀 Quick Example

Now that you're set up, here's what you can do:

**Ask your AI assistant:**
> "Can you search for available domains with 'myawesomeproject' in the name?"

**Your AI assistant will:**
1. Ask permission to use the domain search tool
2. Search name.com's test environment safely
3. Show you available options with pricing
4. Help you register if you want (in test mode)

**Other things to try:**
- "List my current domains"
- "Show me DNS records for my domain"
- "Help me register a new domain"
- "Check if example.com is available"

## Environment Details

Understanding the different name.com environments and their credentials:

### Test Environment (Default - Recommended)
- **URL**: `https://mcp.dev.name.com` (default)
- **Credentials**: Use your **test username and token** from name.com
- **Safety**: Operations won't affect real domains or billing
- **Purpose**: Safe experimentation and testing

### Production Environment (Advanced)
- **URL**: `https://mcp.name.com` (set `NAME_API_URL=https://mcp.name.com`)
- **Credentials**: Use your **production username and token** from name.com
- **⚠️ **DANGER**: All operations affect your real name.com account and domains
- **Billing**: Domain registrations and services will incur real charges
- **Purpose**: Live domain management

### Credential Matching
**Critical**: Make sure your credentials match your environment:
- Test environment (`mcp.dev.name.com`) → Test credentials
- Production environment (`mcp.name.com`) → Production credentials

Using wrong credentials will result in authentication errors.

## Getting name.com API Credentials

If you need to generate new API credentials or want to understand the different environments:

**IMPORTANT**: name.com provides different credentials for test vs production environments. Make sure you're using the correct credentials for your chosen environment.

1. Log in to your name.com account
2. Go to Account Settings > API Tokens
3. Generate an API token
4. **Note**: When you generate a token, name.com provides:
   - **Test credentials** (username/token) for `mcp.dev.name.com`
   - **Production credentials** (username/token) for `mcp.name.com`
5. Copy the correct username and token for the environment you plan to use

## Testing & Debugging (Optional)

The following section is for testing and troubleshooting your setup. If everything is working with your AI assistant, you can skip this section.

### Basic Testing

**Start your AI tool and try these questions:**
- "Can you list my domains?"
- "Search for available domains with the name 'example'"
- "Show me the DNS records for my domain"
- "Help me register a new domain"

Your AI tool will request permission to use name.com tools, and the conversation should flow naturally.

---

### Advanced Debugging: MCP Inspector

The MCP Inspector is **excellent for testing and troubleshooting** your MCP server setup if you're experiencing issues.

1. **Install the MCP Inspector** (if not already installed):
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. **Run the Inspector with your credentials**:
   ```bash
   NAME_USERNAME=your-test-username NAME_TOKEN=your-test-token npx @modelcontextprotocol/inspector namecom-mcp
   ```

   **For production environment** (advanced):
   ```bash
   NAME_USERNAME=your-prod-username NAME_TOKEN=your-prod-token NAME_API_URL=https://mcp.name.com npx @modelcontextprotocol/inspector namecom-mcp
   ```

3. **Open the Inspector**:
   - The command will output a local URL with an auth token (e.g., `http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=...`)
   - Open this URL in your browser

4. **Test the Connection**:
   - Click "Connect" in the left sidebar
   - Once connected, click "List Tools" in the center to see all available name.com API tools
   - Select any tool to test that the endpoints are working through the MCP server
   - If you dont see any errors, but only a couple tools show up, there may have been an issue parsing the OpenAPI spec on startup. Please report this issue.

## Security & Performance

- **API Token Security**: Treat your name.com API token like a password
- **Safe Testing**: Default test environment provides safe experimentation
- **Least Privilege**: The server only accesses name.com APIs with the permissions of your API token
- **Input Validation**: All inputs are validated using Zod schemas
- **Error Handling**: Errors are handled gracefully without exposing sensitive information
- **API Rate Limits**: Respects name.com's standard rate limits
- **Fast Startup**: Tool generation takes ~2-3 seconds on first startup

## Troubleshooting

### Common Issues

1. **Authentication Errors**: 
   - Verify your `NAME_USERNAME` and `NAME_TOKEN` are correct
   - **Most Common**: Make sure you're using the correct credentials for your environment ([see Environment Details](#environment-details))
   - Need new credentials? [Get them here](#getting-namecom-api-credentials)

2. **API URL Issues**: The tool defaults to test environment (`mcp.dev.name.com`)

3. **Tool Generation Fails**: The server will fall back to basic tools if OpenAPI spec loading fails

4. **Package Not Found**: 
   - Make sure you've installed the package: `npm install -g namecom-mcp`
   - Try reinstalling if you encounter issues: `npm uninstall -g namecom-mcp && npm install -g namecom-mcp`

5. **MCP Configuration Issues**:
   - Check your MCP config file path and JSON syntax (see Configuration section for file locations)
   - **Restart your AI tool** (like Claude Desktop) after configuration changes
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
3. Verify your credentials work with name.com's API directly
4. Check [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues) for known issues
5. Report bugs or request features on [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues)

**For name.com account or API issues:**
- [name.com Support](https://www.name.com/support) - Account and billing support
- [name.com API Documentation](https://docs.name.com) - API reference and guides

## FAQ

**Q: What AI tools work with this?**
A: Any tool that supports MCP - Claude Desktop, Cursor, Continue, and many others.

**Q: Is it safe to test?**
A: Yes! The default test environment won't affect real domains or billing.

**Q: Can I use this with production domains?**
A: Yes, set `NAME_API_URL=https://mcp.name.com` and use production credentials. **⚠️ This will affect your real account and may incur charges.**

**Q: Why am I getting authentication errors?**
A: Usually mismatched credentials - test credentials work with test environment, production credentials with production environment. [See Environment Details](#environment-details) for credential requirements.

**Q: How much does it cost?**
A: The MCP server is free. You only pay for actual name.com services you use.

**Q: Does it work offline?**
A: No, it needs internet access to communicate with name.com's API.

## MCP Ecosystem

This server is part of the growing Model Context Protocol ecosystem. The MCP is rapidly gaining adoption across AI tools, and this name.com server works with any MCP-compatible tool, giving you flexibility in choosing your preferred AI assistant for domain management tasks.

**Related MCP Resources:**
- **[MCP Inspector](https://github.com/modelcontextprotocol/inspector)**: Debug and test MCP servers
- **[MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)**: Build your own MCP servers
- **[MCP Protocol](https://modelcontextprotocol.io/)**: Learn more about the Model Context Protocol

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/namedotcom/namecom-mcp/issues)
- **Documentation**: See the [name.com API Documentation](https://docs.name.com) for API details
- **MCP Protocol**: Learn more about [Model Context Protocol](https://modelcontextprotocol.io/)

## Changelog

See the [GitHub Releases](https://github.com/namedotcom/namecom-mcp/releases) page for version history and updates. 