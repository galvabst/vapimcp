/**
 * Vapi behavior rules: core (Kern) + three on-demand topics.
 * Used by get_vapi_behavior_rules and tools_documentation(topic: vapi_*).
 */

export const VAPI_BEHAVIOR_RULES_CORE = `# Vapi Behavior Rules (Core)

## Rules first
When building or editing Vapi assistants or calls, always call this tool first in the conversation. Then follow the process and output contract below.

## Quality Gate
1. **Plan** – Define goal, assistant name, tools, and prompts before creating anything.
2. **Create** – Only then call create_assistant or create_assistant_from_preset.
3. **Optional** – Before relying on the API, call vapi_health_check to verify VAPI_TOKEN.
4. **Never** create_assistant or create_call without a written plan first.

## MUST
- No secrets (API keys, tokens) in prompts or tool config. Use env/credentials only.
- Phone numbers: E.164 format. Get IDs from list_assistants and list_phone_numbers before create_call.
- Assistant names: semantic and clear (e.g. "Support Agent DE", "Outbound Recruiter").
- Heavy logic: do not put in prompts; use n8n, webhooks, or external tools.

## SHOULD
- firstMessage and systemPrompt: short and unambiguous.
- Use presets (create_assistant_from_preset) for quick start when applicable.
- Document tool inputs/outputs when attaching custom tools to assistants.

## Verboten (Forbidden)
- API keys or secrets in assistant config or prompts.
- Creating assistants or calls without a prior plan.
- Using unverified or untested phone number IDs (always list_phone_numbers / list_assistants first).

## Short architecture overview
- **One assistant** for a single role/use case; **multiple assistants** when you have distinct flows (e.g. support vs. sales).
- **Inbound**: number receives calls; **Outbound**: create_call with assistantId and customer.phoneNumber.
- Tool calls during a call: prefer sync, short responses; offload long work to webhooks/n8n.

---

## When you need more detail, call:

- **Solution structure (Inbound/Outbound, assistants, tool flow, n8n):**
  \`tools_documentation({ topic: "vapi_architecture_templates", depth: "full" })\`

- **Build order (no direct create without plan):**
  \`tools_documentation({ topic: "vapi_mandatory_build_process", depth: "full" })\`

- **Response format (Goal, Plan, Tool List, Implementation, then tool calls):**
  \`tools_documentation({ topic: "vapi_output_contract", depth: "full" })\`
`;

export const VAPI_ARCHITECTURE_TEMPLATES = `# Vapi Architecture Templates

## When one assistant vs. several
- **One assistant**: Single role (e.g. support, appointment booking). One firstMessage, one systemPrompt, one set of tools.
- **Several assistants**: Different products, languages, or flows (e.g. support vs. sales, DE vs. EN). Use list_assistants to manage; create_call picks one by assistantId.

## Inbound vs. Outbound
- **Inbound**: Customer calls a Vapi phone number. Configure the number in Vapi (or Twilio/SIP) to point to an assistant. Use list_phone_numbers / get_phone_number to verify.
- **Outbound**: You initiate: create_call with assistantId and customer (object with phoneNumber in E.164). Optional phoneNumberId for caller ID; optional scheduledAt for scheduled calls.

## Tool-call flow during a call
- **Sync**: Assistant calls a tool (e.g. MCP or webhook); response should be fast and concise so the user is not left waiting.
- **Async / heavy work**: Offload to n8n or your backend via webhook; tool returns "I'm processing this" and the backend notifies later (e.g. callback, SMS).

## n8n / Webhook integration
- Attach tool URLs (or MCP) to the assistant in Vapi. During the call, Vapi invokes the tool; your endpoint (or n8n workflow) handles the logic.
- Keep tool responses short; do not put business logic in the assistant prompt. Use tools for: lookup, booking, CRM update, sending SMS, etc.
`;

export const VAPI_MANDATORY_BUILD_PROCESS = `# Vapi Mandatory Build Process

When asked to build or modify Vapi assistants or calls, follow this order:

1. **Clarify the goal** – One sentence: what should the assistant do? (e.g. "Handle inbound support in DE, create Zoho ticket, send SMS confirmation.")
2. **Assistant plan** – Name, firstMessage, systemPrompt (short), and which tools (if any): webhook URLs, MCP, or "none".
3. **Create** – Call create_assistant (or create_assistant_from_preset) with the planned fields. Never paste secrets; use placeholders or env references in docs only.
4. **Optional: create_call** – If the user wants an outbound call, use list_assistants to get the new assistantId and list_phone_numbers for phoneNumberId; then create_call with assistantId and customer.phoneNumber (E.164).
5. **Optional: health check** – Before assuming the API works, call vapi_health_check.

Never create an assistant or call without completing steps 1–2 first. Never embed API keys or secrets in config.
`;

export const VAPI_OUTPUT_CONTRACT = `# Vapi Output Contract

For every request to build or modify Vapi assistants or calls, respond in this structure:

**A) Goal** – One sentence + assumptions (e.g. language, integrations).

**B) Assistant plan** – Name, firstMessage (short), systemPrompt (short), tools (list or "none").

**C) Tool list** – Which tools (webhook, MCP, preset) and what they do in one line each.

**D) Implementation steps** – What you will do first, second (e.g. create_assistant with name X, then create_call if requested).

**E) Tool calls** – Only after A–D: call create_assistant, create_assistant_from_preset, or create_call as planned. Do not output raw JSON in the reply unless the user asks; use the MCP tools.

If the user only asks for a plan, output A–D and do not call create_* until they confirm.
`;

const SECTION_TO_TOPIC: Record<string, string> = {
  templates: 'vapi_architecture_templates',
  build_process: 'vapi_mandatory_build_process',
  output_contract: 'vapi_output_contract',
};

export function getVapiBehaviorRulesCore(): string {
  return VAPI_BEHAVIOR_RULES_CORE;
}

export function getVapiBehaviorRulesBySection(section: string): string | null {
  const topic = SECTION_TO_TOPIC[section];
  if (!topic) return null;
  switch (topic) {
    case 'vapi_architecture_templates':
      return VAPI_ARCHITECTURE_TEMPLATES;
    case 'vapi_mandatory_build_process':
      return VAPI_MANDATORY_BUILD_PROCESS;
    case 'vapi_output_contract':
      return VAPI_OUTPUT_CONTRACT;
    default:
      return null;
  }
}

export function getVapiBehaviorRulesByTopic(topic: string): string | null {
  const n = topic.trim().toLowerCase();
  if (n === 'vapi_architecture_templates') return VAPI_ARCHITECTURE_TEMPLATES;
  if (n === 'vapi_mandatory_build_process') return VAPI_MANDATORY_BUILD_PROCESS;
  if (n === 'vapi_output_contract') return VAPI_OUTPUT_CONTRACT;
  return null;
}
