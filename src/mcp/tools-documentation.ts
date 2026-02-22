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
  update_assistant: {
    tips: ['Use serverUrl to set webhook/server URL for call events. Partial update: only send fields you want to change.'],
    example: 'update_assistant with assistantId and serverUrl https://your-server.com/webhook',
    useCases: ['Set webhook URL for callbacks', 'Change system prompt or voice', 'Adjust model config'],
  },
  delete_assistant: {
    tips: ['Permanently removes the assistant. Use with care.'],
    useCases: ['Remove test assistants', 'Clean up unused agents'],
  },
  create_call: {
    tips: ['customer must be JSON with phoneNumber (E.164). Use assistantId and optional phoneNumberId from list_assistants/list_phone_numbers.'],
    example: 'create_call with assistantId, customer {"phoneNumber":"+49123456789"}',
    useCases: ['Start outbound call', 'Trigger voice agent from Lovable or Cursor'],
  },
  update_call: {
    tips: ['Update call status or assistant overrides. Requires callId.'],
    useCases: ['Adjust in-progress call', 'Update variableValues'],
  },
  delete_call: {
    tips: ['Cancel or remove a call by ID.'],
    useCases: ['Cancel scheduled call', 'Clean up call record'],
  },
  list_phone_numbers: {
    tips: ['Phone number IDs are needed for Vapi outbound calls (phoneNumberId).'],
    useCases: ['Get phoneNumberId for create_call', 'Verify numbers for outbound'],
  },
  get_phone_number: {
    tips: ['Returns full phone number config including assistantId, server, provider.'],
    useCases: ['Inspect number before update or create_call'],
  },
  create_phone_number: {
    tips: ['Provider e.g. twilio; number is E164 or provider number. Set assistantId or serverUrl for inbound routing.'],
    example: 'create_phone_number with provider twilio, number +1234567890, assistantId, name "Support Line"',
    useCases: ['Bind Twilio number to Vapi', 'Assign assistant to number', 'Set webhook URL for number'],
  },
  update_phone_number: {
    tips: ['Partial update: assistantId, name, or serverUrl. Use with care on production numbers.'],
    example: 'update_phone_number with phoneNumberId and serverUrl https://your-server.com/webhook',
    useCases: ['Change assistant for inbound calls', 'Set webhook URL', 'Rename number for reference'],
  },
  delete_phone_number: {
    tips: ['Permanently removes the phone number from Vapi. Use with care.'],
    useCases: ['Release number', 'Clean up test numbers'],
  },
  list_tools: {
    tips: ['Custom tools (e.g. MCP or webhook URLs) can be attached to assistants in Vapi Dashboard.'],
    useCases: ['See which tools an assistant can use during a call'],
  },
  create_tool: {
    tips: ['Creates an endpoint tool (type apiRequest). Attach to assistants in Vapi Dashboard or via update_assistant.'],
    example: 'create_tool with name "book_slot", url "https://api.example.com/book"',
    useCases: ['Add webhook/API tool for assistants', 'Custom functions during calls'],
  },
  update_tool: {
    tips: ['Partial update: name, url, or description.'],
    useCases: ['Change tool endpoint URL', 'Rename or describe tool'],
  },
  delete_tool: {
    tips: ['Permanently removes the custom tool. Detach from assistants first if needed.'],
    useCases: ['Remove unused tools', 'Replace with new tool'],
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
  const lines: string[] = ['# Vapi MCP Tools Overview', '', 'Use these tools from Cursor or Lovable to manage Vapi assistants, calls, phone numbers, and custom tools. Assistants, tools, and phone numbers support full CRUD (create, update, delete). Set webhook/server URL via update_assistant (serverUrl) or update_phone_number (serverUrl). Use list_assistants and list_phone_numbers to get IDs for create_call or external automation.', ''];
  for (const t of vapiToolDefinitions) {
    const extra = EXTRA_DOCS[t.name];
    lines.push(`- **${t.name}**: ${t.description}`);
    if (extra?.tips?.length && depth === 'essentials') lines.push(`  - Tips: ${extra.tips.join('; ')}`);
    if (extra?.example && depth === 'full') lines.push(`  - Example: ${extra.example}`);
  }
  lines.push('', '## Integration', '', 'Assistant and phone number IDs from list_assistants/list_phone_numbers can be used in create_call or in any external system (Lovable, Cursor, automation). Use update_assistant or update_phone_number with serverUrl to configure webhooks for call events. Use create_tool to add custom endpoint tools for assistants. Use create_phone_number/update_phone_number to bind and configure numbers without the Dashboard.');
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
