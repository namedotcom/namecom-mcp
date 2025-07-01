import { fetch } from "undici";
import { readFileSync, appendFileSync } from "fs";
import { NAME_USERNAME, NAME_TOKEN, NAME_API_URL } from "./config.js";
// Read version from package.json
let VERSION = ''; // fallback version
try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    VERSION = packageJson.version;
}
catch (error) {
    // Use fallback version if reading fails
}
// Trusted MCP URLs that we can safely bypass SSL validation for
const TRUSTED_MCP_URLS = [
    'https://mcp.dev.name.com',
    'https://mcp.name.com'
];
// Enhanced file logging function (kept for future debugging)
// To check logs: cat /tmp/mcp-debug.log
// To clear logs: rm -f /tmp/mcp-debug.log
function logToFile(message) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync('/tmp/mcp-debug.log', `[${timestamp}] ${message}\n`);
    }
    catch (error) {
        // Ignore logging errors
    }
}
/**
 * Helper function to make authenticated requests to name.com API
 */
export async function callNameApi(apiPath, method = "GET", body = null) {
    const credentials = Buffer.from(`${NAME_USERNAME}:${NAME_TOKEN}`).toString('base64');
    const options = {
        method,
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'User-Agent': `namecom-mcp/${VERSION}`
        }
    };
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }
    // Ensure apiPath starts with a slash
    const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    // Ensure NAME_API_URL doesn't end with a slash to avoid double slashes
    const baseUrl = NAME_API_URL?.endsWith('/') ? NAME_API_URL.slice(0, -1) : NAME_API_URL;
    const fullUrl = `${baseUrl}${normalizedPath}`;
    // Only bypass SSL validation for trusted MCP URLs
    const isTrustedUrl = TRUSTED_MCP_URLS.some(trustedUrl => baseUrl.startsWith(trustedUrl));
    const originalTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    if (isTrustedUrl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    try {
        const response = await fetch(fullUrl, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`name.com API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Handle 204 No Content responses
        if (response.status === 204) {
            return undefined;
        }
        return await response.json();
    }
    catch (error) {
        throw error;
    }
    finally {
        // Restore original TLS setting (only if we changed it)
        if (isTrustedUrl) {
            if (originalTlsReject !== undefined) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsReject;
            }
            else {
                delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
            }
        }
    }
}
