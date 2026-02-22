/**
 * Vapi tools (custom tools for assistants): list, get.
 */

import { vapiGet } from '../../lib/vapi-client.js';

function normalizeListResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown[] }).data)) {
    return (data as { data: unknown[] }).data;
  }
  return [];
}

export async function handleListVapiTools(): Promise<Record<string, unknown>> {
  const data = await vapiGet<unknown>('/tool');
  return { tools: normalizeListResponse(data) };
}

export async function handleGetVapiTool(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const toolId = String(args?.toolId ?? '');
  if (!toolId) return { error: 'toolId is required' };
  const data = await vapiGet<Record<string, unknown>>(`/tool/${toolId}`);
  return data ?? {};
}
