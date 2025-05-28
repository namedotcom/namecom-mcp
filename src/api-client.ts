import { NameApiResponse, FetchOptions } from "./types.js";
import { NAME_USERNAME, NAME_TOKEN, NAME_API_URL } from "./config.js";

/**
 * Helper function to make authenticated requests to Name.com API
 */
export async function callNameApi(
  apiPath: string, 
  method: string = "GET", 
  body: any = null
): Promise<NameApiResponse> {
  const credentials = Buffer.from(`${NAME_USERNAME}:${NAME_TOKEN}`).toString('base64');
  
  const options: FetchOptions = {
    method,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
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
    throw new Error(`Name.com API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as any;
  }
  
  return await response.json() as NameApiResponse;
} 