import { fetch } from "undici";
import { appendFileSync } from "fs";
import { NAME_USERNAME, NAME_TOKEN, NAME_API_URL } from "./config.js";
import { VERSION } from "./version.js";
/** What the connected AI client said it is, for example ` (claude-code/2.1.3)`. Empty until then. */
let clientTag = '';
/** Keeps a name or version safe and short enough to put in a log line. */
function cleanForUserAgent(value) {
    if (typeof value !== 'string')
        return '';
    return value.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}
/**
 * Called once the MCP client has connected, with the name and version it sent. They go in the
 * User-Agent, so the Core API's access logs show which AI clients use the package.
 */
export function setClientInfo(info) {
    const name = cleanForUserAgent(info?.name);
    if (name === '') {
        clientTag = '';
        return;
    }
    const version = cleanForUserAgent(info?.version);
    clientTag = ` (${version === '' ? name : `${name}/${version}`})`;
}
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
export async function callNameApi(apiPath, method = "GET", body = null, extraHeaders = {}) {
    const credentials = Buffer.from(`${NAME_USERNAME}:${NAME_TOKEN}`).toString('base64');
    const options = {
        method,
        headers: {
            // The operation's own headers, such as X-Idempotency-Key, go first so none of them
            // can replace the credentials below.
            ...extraHeaders,
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'User-Agent': `namecom-mcp/${VERSION}${clientTag}`
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
