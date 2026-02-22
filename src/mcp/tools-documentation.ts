/**
 * getToolsOverview(depth), getToolDocumentation(topic, depth).
 * Supports tool names and Vapi behavior topics: vapi_behavior_rules, vapi_architecture_templates, vapi_mandatory_build_process, vapi_output_contract.
 */

import { vapiToolDefinitions } from './tools.js';
import {
  getVapiBehaviorRulesCore,
  getVapiBehaviorRulesByTopic,
} from './content/vapi-behavior-rules.js';

const EXTRA_DOCS: Record<string, { tips?: string[]; example?: string; useCases?: string[] }> = {
  list_assistants: {
    tips: ['Use assistant IDs in create_call or external automation.'],
    example: 'list_assistants with limit 10 to get recent assistants.',
    useCases: ['Get assistant IDs for create_call', 'List all voice agents'],
  },
  get_assistant: {
    tips: ['Returns full config: model, voice, firstMessage, systemPrompt.'],
    useCases: ['Inspect assistant before using in create_call or editing'],
  },
  create_assistant: {
    tips: ['model and voice can be JSON strings. Use create_assistant_from_preset for quick start.'],
    example: 'create_assistant with name, firstMessage, and model {"provider":"openai","model":"gpt-4o"}',
    useCases: ['Create voice agent from Cursor or Lovable', 'Duplicate and tweak from preset'],
  },
  create_call: {
    tips: ['customer must be JSON with phoneNumber (E.164). Use assistantId and optional phoneNumberId from list_assistants/list_phone_numbers.'],
    example: 'create_call with assistantId, customer {"phoneNumber":"+49123456789"}',
    useCases: ['Start outbound call', 'Trigger voice agent from Lovable or Cursor'],
  },
  list_phone_numbers: {
    tips: ['Phone number IDs are needed for Vapi outbound calls (phoneNumberId).'],
    useCases: ['Get phoneNumberId for create_call', 'Verify numbers for outbound'],
  },
  list_tools: {
    tips: ['Custom tools (e.g. MCP or webhook URLs) can be attached to assistants in Vapi Dashboard.'],
    useCases: ['See which tools an assistant can use during a call'],
  },
  create_assistant_from_preset: {
    tips: ['Presets: support, recruiting, appointment. Override name/firstMessage if needed.'],
    useCases: ['Quick voice agent for support/recruiting/appointments'],
  },
  vapi_health_check: {
    tips: ['Call first to verify VAPI_TOKEN and server health.'],
  },
};

export function getToolsOverview(depth: 'essentials' | 'full'): string {
  const lines: string[] = ['# Vapi MCP Tools Overview', '', 'Use these tools from Cursor or Lovable to manage Vapi assistants, calls, and phone numbers. Use list_assistants and list_phone_numbers to get IDs for create_call or external automation.', ''];
  for (const t of vapiToolDefinitions) {
    const extra = EXTRA_DOCS[t.name];
    lines.push(`- **${t.name}**: ${t.description}`);
    if (extra?.tips?.length && depth === 'essentials') lines.push(`  - Tips: ${extra.tips.join('; ')}`);
    if (extra?.example && depth === 'full') lines.push(`  - Example: ${extra.example}`);
  }
  lines.push('', '## Integration', '', 'Assistant and phone number IDs from list_assistants/list_phone_numbers can be used in create_call or in any external system (Lovable, Cursor, automation).');
  return lines.join('\n');
}

export function getToolDocumentation(topic: string, depth: 'essentials' | 'full'): string {
  const normalized = topic.trim().toLowerCase();
  if (normalized === 'vapi_behavior_rules') {
    return getVapiBehaviorRulesCore();
  }
  const vapiTopicContent = getVapiBehaviorRulesByTopic(topic);
  if (vapiTopicContent) return vapiTopicContent;
  const def = vapiToolDefinitions.find((t) => t.name.toLowerCase() === normalized);
  if (!def) {
    return `Tool "${topic}" not found. Use tools_documentation() without parameters for a list of all tools. Topics include: vapi_behavior_rules, vapi_architecture_templates, vapi_mandatory_build_process, vapi_output_contract.`;
  }
  const extra = EXTRA_DOCS[def.name];
  const parts: string[] = [`# ${def.name}`, '', def.description, ''];
  if (def.inputSchema.required?.length) parts.push(`Required: ${def.inputSchema.required.join(', ')}`, '');
  if (extra?.tips?.length) parts.push('Tips: ' + extra.tips.join('; '), '');
  if (depth === 'full') {
    if (extra?.example) parts.push('Example: ' + extra.example, '');
    if (extra?.useCases?.length) parts.push('Use cases: ' + extra.useCases.join(', '), '');
  }
  return parts.join('\n');
}
