/**
 * Vapi calls: list, get, create, update, delete.
 */

import { vapiGet, vapiPost, vapiPatch, vapiDelete } from '../../lib/vapi-client.js';

function normalizeListResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown[] }).data)) {
    return (data as { data: unknown[] }).data;
  }
  return [];
}

export async function handleListCalls(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const limit = typeof args?.limit === 'string' ? parseInt(args.limit, 10) : 100;
  const qs = isNaN(limit) ? '' : `?limit=${Math.min(Math.max(limit, 1), 100)}`;
  const data = await vapiGet<unknown>(`/call${qs}`);
  return { calls: normalizeListResponse(data) };
}

export async function handleGetCall(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const callId = String(args?.callId ?? '');
  if (!callId) return { error: 'callId is required' };
  const data = await vapiGet<Record<string, unknown>>(`/call/${callId}`);
  return data ?? {};
}

export async function handleCreateCall(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const assistantId = String(args?.assistantId ?? '');
  const customerRaw = args?.customer;
  if (!assistantId) return { error: 'assistantId is required' };
  let num: string;
  if (typeof customerRaw === 'object' && customerRaw !== null) {
    const o = customerRaw as Record<string, unknown>;
    num = String(o.phoneNumber ?? o.number ?? '');
  } else if (typeof customerRaw === 'string') {
    try {
      const o = JSON.parse(customerRaw) as Record<string, unknown>;
      num = String(o.phoneNumber ?? o.number ?? '');
    } catch {
      return { error: 'customer must be JSON with phoneNumber or number (E.164)' };
    }
  } else {
    return { error: 'customer is required (JSON with phoneNumber or number)' };
  }
  if (!num) return { error: 'customer must include phoneNumber or number' };
  const customer = { number: num };
  const body: Record<string, unknown> = { assistantId, customer };
  if (typeof args?.phoneNumberId === 'string' && args.phoneNumberId) body.phoneNumberId = args.phoneNumberId;
  if (typeof args?.scheduledAt === 'string' && args.scheduledAt.trim()) {
    body.schedulePlan = { earliestAt: args.scheduledAt.trim() };
  }
  if (typeof args?.assistantOverrides === 'string' && args.assistantOverrides) {
    try {
      body.assistantOverrides = JSON.parse(args.assistantOverrides);
    } catch {
      // ignore
    }
  }
  const data = await vapiPost<Record<string, unknown>>('/call', body);
  return data ?? {};
}

export async function handleUpdateCall(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const callId = String(args?.callId ?? '');
  if (!callId) return { error: 'callId is required' };
  const body: Record<string, unknown> = {};
  if (typeof args?.status === 'string') body.status = args.status;
  if (typeof args?.assistantOverrides === 'string' && args.assistantOverrides) {
    try {
      body.assistantOverrides = JSON.parse(args.assistantOverrides);
    } catch {
      // ignore
    }
  }
  if (Object.keys(body).length === 0) return { error: 'At least one field to update is required (status, assistantOverrides)' };
  const data = await vapiPatch<Record<string, unknown>>(`/call/${callId}`, body);
  return data ?? {};
}

export async function handleDeleteCall(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const callId = String(args?.callId ?? '');
  if (!callId) return { error: 'callId is required' };
  await vapiDelete<undefined>(`/call/${callId}`);
  return { deleted: true, callId };
}
