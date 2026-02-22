/**
 * Minimal Vapi REST client. Base URL: https://api.vapi.ai
 * All requests use Authorization: Bearer <VAPI_TOKEN>.
 * Clear error messages for 401, 404, 429 (no raw API bodies).
 */

import { getVapiToken } from '../config.js';

const VAPI_BASE = 'https://api.vapi.ai';
const VAPI_REQUEST_TIMEOUT_MS = 30_000;

function apiErrorMessage(status: number, path: string): string {
  switch (status) {
    case 401:
      return 'Vapi: API key invalid or expired. Check VAPI_TOKEN.';
    case 403:
      return 'Vapi: Forbidden. API key may lack permission for this resource.';
    case 404:
      return `Vapi: Not found (${path}). Check ID or resource.`;
    case 429:
      return 'Vapi: Rate limit exceeded. Retry later.';
    default:
      return `Vapi API error ${status}.`;
  }
}

export async function vapiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getVapiToken();
  const url = path.startsWith('http') ? path : `${VAPI_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VAPI_REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const msg = apiErrorMessage(res.status, path);
      throw new Error(msg);
    }
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    if (!text || text.trim() === '') return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error('Vapi API returned invalid JSON.');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') throw new Error('Vapi API request timed out.');
      throw err;
    }
    throw err;
  }
}

export function vapiGet<T>(path: string): Promise<T> {
  return vapiFetch<T>(path, { method: 'GET' });
}

export function vapiPost<T>(path: string, body: unknown): Promise<T> {
  return vapiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function vapiPatch<T>(path: string, body: unknown): Promise<T> {
  return vapiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function vapiDelete<T>(path: string): Promise<T> {
  return vapiFetch<T>(path, { method: 'DELETE' });
}
