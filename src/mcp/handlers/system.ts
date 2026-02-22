/**
 * System handlers: vapi_health_check, tools_documentation, get_vapi_behavior_rules.
 */

import { isVapiConfigured } from '../../config.js';
import { getToolsOverview, getToolDocumentation } from '../tools-documentation.js';
import {
  getVapiBehaviorRulesCore,
  getVapiBehaviorRulesBySection,
} from '../content/vapi-behavior-rules.js';

const SERVER_VERSION = '1.0.0';
const startTime = Date.now();

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  vapiConfigured: boolean;
  version: string;
  uptime: number;
}

/**
 * Check server and optional Vapi connectivity. Never returns secrets.
 */
export async function handleVapiHealthCheck(): Promise<HealthCheckResult> {
  const vapiConfigured = isVapiConfigured();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  let status: 'ok' | 'degraded' = 'ok';

  if (vapiConfigured) {
    try {
      const { vapiGet } = await import('../../lib/vapi-client.js');
      await vapiGet<unknown>('/assistant?limit=1');
    } catch {
      status = 'degraded';
    }
  }

  return {
    status,
    vapiConfigured,
    version: SERVER_VERSION,
    uptime,
  };
}

export function handleToolsDocumentation(args: Record<string, unknown> | undefined): string {
  const topic = typeof args?.topic === 'string' ? args.topic : '';
  const depth =
    typeof args?.depth === 'string' && (args.depth === 'essentials' || args.depth === 'full')
      ? args.depth
      : 'essentials';
  return topic.trim() ? getToolDocumentation(topic, depth) : getToolsOverview(depth);
}

/**
 * get_vapi_behavior_rules: without section returns core; with section returns that topic (templates | build_process | output_contract).
 */
export function handleGetVapiBehaviorRules(args: Record<string, unknown> | undefined): string {
  const section = typeof args?.section === 'string' ? args.section.trim().toLowerCase() : '';
  if (section) {
    const content = getVapiBehaviorRulesBySection(section);
    if (content) return content;
  }
  return getVapiBehaviorRulesCore();
}
