/**
 * Rules-first guard: protected tools require get_vapi_behavior_rules (or tools_documentation with rules topic) to be called first.
 */

export interface SessionState {
  rulesAcknowledged: boolean;
}

export const RULES_PROTECTED_TOOLS = new Set([
  'create_assistant',
  'update_assistant',
  'delete_assistant',
  'create_call',
  'create_assistant_from_preset',
  'create_tool',
  'update_tool',
  'delete_tool',
  'create_phone_number',
  'update_phone_number',
  'delete_phone_number',
]);

export const RULES_REQUIRED_MESSAGE =
  'You must load the Vapi behavior rules first. Call **get_vapi_behavior_rules()** now, read the returned rules (plan before create, no secrets, follow build process). Then retry this operation.';

export const RULES_FIRST_PREFIX =
  'Call get_vapi_behavior_rules() first in this conversation before building or editing assistants/calls. ';

export const RULES_TOPICS = new Set([
  'vapi_behavior_rules',
  'vapi_architecture_templates',
  'vapi_mandatory_build_process',
  'vapi_output_contract',
]);
