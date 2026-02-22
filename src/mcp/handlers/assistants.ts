/**
 * Vapi assistants: list, get, create.
 */

import { vapiGet, vapiPost } from '../../lib/vapi-client.js';

function normalizeListResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown[] }).data)) {
    return (data as { data: unknown[] }).data;
  }
  return [];
}

export async function handleListAssistants(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const limit = typeof args?.limit === 'string' ? parseInt(args.limit, 10) : 100;
  const qs = isNaN(limit) ? '' : `?limit=${Math.min(Math.max(limit, 1), 100)}`;
  const data = await vapiGet<unknown>(`/assistant${qs}`);
  return { assistants: normalizeListResponse(data) };
}

export async function handleGetAssistant(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const assistantId = String(args?.assistantId ?? '');
  if (!assistantId) return { error: 'assistantId is required' };
  const data = await vapiGet<Record<string, unknown>>(`/assistant/${assistantId}`);
  return data ?? {};
}

export async function handleCreateAssistant(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const name = String(args?.name ?? '');
  if (!name) return { error: 'name is required' };
  const body: Record<string, unknown> = { name };
  if (typeof args?.firstMessage === 'string') body.firstMessage = args.firstMessage;
  if (typeof args?.systemPrompt === 'string') body.systemPrompt = args.systemPrompt;
  if (typeof args?.model === 'string') {
    try {
      body.model = JSON.parse(args.model);
    } catch {
      body.model = { provider: 'openai', model: 'gpt-4o' };
    }
  }
  if (typeof args?.voice === 'string') {
    try {
      body.voice = JSON.parse(args.voice);
    } catch {
      body.voice = { provider: '11labs', voiceId: 'cgSgspJ2msm6clMCkdW9' };
    }
  }
  const data = await vapiPost<Record<string, unknown>>('/assistant', body);
  return data ?? {};
}
