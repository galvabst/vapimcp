/**
 * Vapi phone numbers: list, get.
 */

import { vapiGet } from '../../lib/vapi-client.js';

/** Vapi uses /v2/phone-number for list/get (per API reference). */
const PHONE_NUMBER_BASE = '/v2/phone-number';

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
