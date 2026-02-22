/**
 * Central input validation: required params from tool definitions.
 */

import { vapiToolDefinitions } from './tools.js';

export function validateRequired(
  toolName: string,
  args: Record<string, unknown> | undefined,
  required: string[]
): void {
  if (!required.length) return;
  const a = args ?? {};
  const missing: string[] = [];
  for (const key of required) {
    const v = a[key];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      missing.push(key);
    }
  }
  if (missing.length) {
    throw new Error(`Missing or empty required parameter(s) for ${toolName}: ${missing.join(', ')}`);
  }
}

export function getRequiredForTool(toolName: string): string[] {
  const def = vapiToolDefinitions.find((t) => t.name === toolName);
  return def?.inputSchema?.required ?? [];
}
