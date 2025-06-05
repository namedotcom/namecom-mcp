import dotenv from "dotenv";
import path from "path";
// Setup environment - try multiple possible .env locations
const possibleEnvPaths = [
    // For development/testing: from current working directory
    path.resolve(process.cwd(), '.env'),
    // For installed package: one level up from dist
    path.resolve(process.cwd(), '..', '.env'),
];
// Try to load .env file from any of the possible locations
for (const envPath of possibleEnvPaths) {
    try {
        dotenv.config({ path: envPath });
        break; // Stop if successful
    }
    catch {
        // Continue to next path
    }
}
// Name.com API credentials
export const NAME_USERNAME = process.env.NAME_USERNAME;
export const NAME_TOKEN = process.env.NAME_TOKEN;
export const NAME_API_URL = process.env.NAME_API_URL || "https://api.dev.name.com";
// Validate required credentials
if (!NAME_USERNAME || !NAME_TOKEN) {
    process.stderr.write(`
Error: Missing required Name.com API credentials.

Please set the following environment variables:
- NAME_USERNAME: Your Name.com username
- NAME_TOKEN: Your Name.com API token

You can either:
1. Create a .env file with these variables
2. Set them in your Claude Desktop configuration
3. Export them in your shell

For more information, see: https://github.com/namedotcom/namecom-mcp#configuration
`);
    process.exit(1);
}
// Default values for common parameters
export const DEFAULT_VALUES = {
    perPage: 1000,
    page: 1,
    sort: 'name',
    dir: 'asc'
};
// Server configuration
export const SERVER_CONFIG = {
    name: "Name.com API",
    version: "1.0.0"
};
