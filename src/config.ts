import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
export const DEFAULT_VALUES: Record<string, any> = {
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