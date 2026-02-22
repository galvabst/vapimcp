/**
 * Vapi tools (custom tools for assistants): list, get, create, update, delete.
 */

import { vapiGet, vapiPost, vapiPatch, vapiDelete } from '../../lib/vapi-client.js';

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

export async function handleCreateVapiTool(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const name = String(args?.name ?? '').trim();
  const url = String(args?.url ?? '').trim();
  if (!name) return { error: 'name is required' };
  if (!url) return { error: 'url is required (endpoint URL for the tool)' };
  const body: Record<string, unknown> = {
    type: 'apiRequest',
    name,
    url,
  };
  if (typeof args?.description === 'string') body.description = args.description;
  const data = await vapiPost<Record<string, unknown>>('/tool', body);
  return data ?? {};
}

export async function handleUpdateVapiTool(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const toolId = String(args?.toolId ?? '');
  if (!toolId) return { error: 'toolId is required' };
  const body: Record<string, unknown> = {};
  if (typeof args?.name === 'string') body.name = args.name;
  if (typeof args?.url === 'string') body.url = args.url;
  if (typeof args?.description === 'string') body.description = args.description;
  if (Object.keys(body).length === 0) return { error: 'At least one field to update is required (name, url, description)' };
  const data = await vapiPatch<Record<string, unknown>>(`/tool/${toolId}`, body);
  return data ?? {};
}

export async function handleDeleteVapiTool(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const toolId = String(args?.toolId ?? '');
  if (!toolId) return { error: 'toolId is required' };
  await vapiDelete<undefined>(`/tool/${toolId}`);
  return { deleted: true, toolId };
}
