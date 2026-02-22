/**
 * Vapi MCP config: VAPI_TOKEN (required for API), optional MCP_API_KEY for HTTP/SSE.
 */

export function isVapiConfigured(): boolean {
  const token = process.env.VAPI_TOKEN;
  return Boolean(token && typeof token === 'string' && token.trim() !== '');
}

/**
 * Returns Vapi API token. Throws if not configured.
 */
export function getVapiToken(): string {
  if (!isVapiConfigured()) {
    throw new Error('Vapi is not configured. Set VAPI_TOKEN in environment.');
  }
  return process.env.VAPI_TOKEN!.trim();
}

/**
 * Optional Bearer token for HTTP/SSE access (e.g. Lovable). Undefined if not set.
 */
export function getOptionalMcpApiKey(): string | undefined {
  const key = process.env.MCP_API_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') return undefined;
  return key.trim();
}
