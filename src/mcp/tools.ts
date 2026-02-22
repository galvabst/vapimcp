/**
 * Vapi MCP tool definitions for ListTools.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, { type?: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
}

export const vapiToolDefinitions: ToolDefinition[] = [
  {
    name: 'tools_documentation',
    description: 'Get documentation for all MCP tools. Call without parameters for overview; use topic and depth for specific tool docs. Topics include tool names and: vapi_behavior_rules, vapi_architecture_templates, vapi_mandatory_build_process, vapi_output_contract.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Tool name e.g. list_assistants, or vapi_behavior_rules, vapi_architecture_templates, vapi_mandatory_build_process, vapi_output_contract' },
        depth: { type: 'string', description: 'essentials or full', enum: ['essentials', 'full'] },
      },
    },
  },
  {
    name: 'get_vapi_behavior_rules',
    description: 'Get Vapi behavior rules (core). Call first when building or editing assistants/calls. Optional section: templates | build_process | output_contract for on-demand detail.',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'string', description: 'Optional: templates | build_process | output_contract for that topic only', enum: ['templates', 'build_process', 'output_contract'] },
      },
    },
  },
  {
    name: 'vapi_health_check',
    description: 'Check Vapi configuration and server health. Returns status, vapiConfigured, version, uptime. No secrets in response.',
    inputSchema: { type: 'object' },
  },
  {
    name: 'list_assistants',
    description: 'List all Vapi assistants. Optional limit.',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'string', description: 'Max number to return (default 100)' } },
    },
  },
  {
    name: 'get_assistant',
    description: 'Get a Vapi assistant by ID.',
    inputSchema: {
      type: 'object',
      properties: { assistantId: { type: 'string' } },
      required: ['assistantId'],
    },
  },
  {
    name: 'create_assistant',
    description: 'Create a new Vapi assistant. Provide name, model config, voice, firstMessage, and optional systemPrompt.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        model: { type: 'string', description: 'JSON string for model config e.g. {"provider":"openai","model":"gpt-4o"}' },
        voice: { type: 'string', description: 'JSON string for voice e.g. {"provider":"11labs","voiceId":"..."}' },
        firstMessage: { type: 'string' },
        systemPrompt: { type: 'string' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_calls',
    description: 'List Vapi calls. Optional limit.',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'string' } },
    },
  },
  {
    name: 'get_call',
    description: 'Get a Vapi call by ID.',
    inputSchema: {
      type: 'object',
      properties: { callId: { type: 'string' } },
      required: ['callId'],
    },
  },
  {
    name: 'create_call',
    description: 'Start an outbound call. Required: assistantId and customer.phoneNumber. Optional: phoneNumberId, scheduledAt, assistantOverrides.',
    inputSchema: {
      type: 'object',
      properties: {
        assistantId: { type: 'string' },
        phoneNumberId: { type: 'string' },
        customer: { type: 'string', description: 'JSON e.g. {"phoneNumber":"+49..."}' },
        scheduledAt: { type: 'string', description: 'ISO datetime for scheduled call (maps to schedulePlan.earliestAt)' },
        assistantOverrides: { type: 'string', description: 'JSON for variableValues etc.' },
      },
      required: ['assistantId', 'customer'],
    },
  },
  {
    name: 'list_phone_numbers',
    description: 'List all Vapi phone numbers.',
    inputSchema: { type: 'object' },
  },
  {
    name: 'get_phone_number',
    description: 'Get a Vapi phone number by ID.',
    inputSchema: {
      type: 'object',
      properties: { phoneNumberId: { type: 'string' } },
      required: ['phoneNumberId'],
    },
  },
  {
    name: 'list_tools',
    description: 'List all Vapi tools (custom tools for assistants).',
    inputSchema: { type: 'object' },
  },
  {
    name: 'get_tool',
    description: 'Get a Vapi tool by ID.',
    inputSchema: {
      type: 'object',
      properties: { toolId: { type: 'string' } },
      required: ['toolId'],
    },
  },
  {
    name: 'list_presets',
    description: 'List available assistant presets (vorgefertigte Agents). Use create_assistant_from_preset with a preset id.',
    inputSchema: { type: 'object' },
  },
  {
    name: 'create_assistant_from_preset',
    description: 'Create a Vapi assistant from a preset (support, recruiting, appointment). Optional overrides: name, firstMessage.',
    inputSchema: {
      type: 'object',
      properties: {
        presetId: { type: 'string', description: 'support | recruiting | appointment', enum: ['support', 'recruiting', 'appointment'] },
        name: { type: 'string' },
        firstMessage: { type: 'string' },
      },
      required: ['presetId'],
    },
  },
];
