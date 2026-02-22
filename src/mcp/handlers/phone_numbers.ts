/**
 * Vapi phone numbers: list, get, create, update, delete.
 */

import { vapiGet, vapiPost, vapiPatch, vapiDelete } from '../../lib/vapi-client.js';

/** Vapi uses /v2/phone-number for list/get (per API reference). */
const PHONE_NUMBER_BASE = '/v2/phone-number';
/** Create/Update/Delete per docs use /phone-number (no v2). */
const PHONE_NUMBER_WRITE_PATH = '/phone-number';

export async function handleListPhoneNumbers(): Promise<Record<string, unknown>> {
  const data = await vapiGet<unknown>(`${PHONE_NUMBER_BASE}?limit=100`);
  const list = Array.isArray(data) ? data : (data && typeof data === 'object' && 'data' in data ? (data as { data: unknown[] }).data : []);
  return { phoneNumbers: Array.isArray(list) ? list : [] };
}

export async function handleGetPhoneNumber(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const phoneNumberId = String(args?.phoneNumberId ?? '');
  if (!phoneNumberId) return { error: 'phoneNumberId is required' };
  const data = await vapiGet<Record<string, unknown>>(`${PHONE_NUMBER_BASE}/${phoneNumberId}`);
  return data ?? {};
}

export async function handleCreatePhoneNumber(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const provider = String(args?.provider ?? '').trim();
  const number = String(args?.number ?? '').trim();
  if (!provider) return { error: 'provider is required (e.g. twilio)' };
  if (!number) return { error: 'number is required' };
  const body: Record<string, unknown> = { provider, number };
  if (typeof args?.assistantId === 'string' && args.assistantId.trim()) body.assistantId = args.assistantId.trim();
  if (typeof args?.name === 'string' && args.name.trim()) body.name = args.name.trim();
  if (typeof args?.serverUrl === 'string' && args.serverUrl.trim()) body.server = { url: args.serverUrl.trim() };
  if (args?.smsEnabled !== undefined) {
    body.smsEnabled = typeof args.smsEnabled === 'boolean' ? args.smsEnabled : String(args.smsEnabled).toLowerCase() === 'true';
  }
  const data = await vapiPost<Record<string, unknown>>(PHONE_NUMBER_WRITE_PATH, body);
  return data ?? {};
}

export async function handleUpdatePhoneNumber(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const phoneNumberId = String(args?.phoneNumberId ?? '').trim();
  if (!phoneNumberId) return { error: 'phoneNumberId is required' };
  const body: Record<string, unknown> = {};
  if (typeof args?.assistantId === 'string' && args.assistantId.trim()) body.assistantId = args.assistantId.trim();
  if (typeof args?.name === 'string') body.name = args.name.trim();
  if (typeof args?.serverUrl === 'string' && args.serverUrl.trim()) body.server = { url: args.serverUrl.trim() };
  if (Object.keys(body).length === 0) return { error: 'At least one field to update is required (assistantId, name, serverUrl)' };
  const data = await vapiPatch<Record<string, unknown>>(`${PHONE_NUMBER_WRITE_PATH}/${phoneNumberId}`, body);
  return data ?? {};
}

export async function handleDeletePhoneNumber(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const phoneNumberId = String(args?.phoneNumberId ?? '').trim();
  if (!phoneNumberId) return { error: 'phoneNumberId is required' };
  await vapiDelete(`${PHONE_NUMBER_WRITE_PATH}/${phoneNumberId}`);
  return { deleted: true, phoneNumberId };
}
