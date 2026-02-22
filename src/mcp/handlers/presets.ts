/**
 * Presets: list_presets, create_assistant_from_preset.
 */

import { listPresets, getPreset } from '../presets/assistants.js';
import { vapiPost } from '../../lib/vapi-client.js';

export function handleListPresets(): Record<string, unknown> {
  return listPresets();
}

export async function handleCreateAssistantFromPreset(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const presetId = String(args?.presetId ?? '').toLowerCase();
  const preset = getPreset(presetId);
  if (!preset) return { error: `Unknown presetId: ${presetId}. Use support, recruiting, or appointment.` };

  const name = typeof args?.name === 'string' && args.name.trim() ? args.name.trim() : preset.name;
  const firstMessage = typeof args?.firstMessage === 'string' && args.firstMessage.trim() ? args.firstMessage : preset.firstMessage;

  const body = {
    name,
    firstMessage,
    model: preset.model,
    voice: preset.voice,
    systemPrompt: preset.systemPrompt,
  };
  const data = await vapiPost<Record<string, unknown>>('/assistant', body);
  return data ?? {};
}
