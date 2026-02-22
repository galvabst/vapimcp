/**
 * Vapi MCP server: ListTools, CallTool with executeTool dispatcher.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { vapiToolDefinitions } from './tools.js';
import { handleVapiHealthCheck, handleToolsDocumentation } from './handlers/system.js';
import * as assistants from './handlers/assistants.js';
import * as calls from './handlers/calls.js';
import * as phoneNumbers from './handlers/phone_numbers.js';
import * as vapiTools from './handlers/tools.js';
import * as presets from './handlers/presets.js';
import { getRequiredForTool, validateRequired } from './validate.js';
import { logger } from '../lib/logger.js';

const SERVER_NAME = 'vapi-mcp';
const SERVER_VERSION = '1.0.0';

const IMPLEMENTED_TOOLS = new Set([
  'tools_documentation',
  'vapi_health_check',
  'list_assistants',
  'get_assistant',
  'create_assistant',
  'list_calls',
  'get_call',
  'create_call',
  'list_phone_numbers',
  'get_phone_number',
  'list_tools',
  'get_tool',
  'list_presets',
  'create_assistant_from_preset',
]);

function assertAllToolsImplemented(): void {
  const missing = vapiToolDefinitions.filter((t) => !IMPLEMENTED_TOOLS.has(t.name)).map((t) => t.name);
  if (missing.length) throw new Error(`Tools defined but not implemented: ${missing.join(', ')}`);
}

function listTools() {
  return vapiToolDefinitions.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

function sanitizeErrorMessage(msg: string): string {
  return msg.replace(/\b[A-Za-z0-9_-]{30,}\b/g, (m) => (m.length > 40 ? '[REDACTED]' : m));
}

async function executeTool(
  name: string,
  args: Record<string, unknown> | undefined
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const required = getRequiredForTool(name);
    validateRequired(name, args, required);

    logger.debug('Tool call', { tool: name });
    let text: string;
    switch (name) {
      case 'tools_documentation':
        text = handleToolsDocumentation(args);
        break;
      case 'vapi_health_check': {
        const health = await handleVapiHealthCheck();
        text = JSON.stringify(health);
        break;
      }
      case 'list_assistants':
        text = JSON.stringify(await assistants.handleListAssistants(args ?? {}));
        break;
      case 'get_assistant':
        text = JSON.stringify(await assistants.handleGetAssistant(args ?? {}));
        break;
      case 'create_assistant':
        text = JSON.stringify(await assistants.handleCreateAssistant(args ?? {}));
        break;
      case 'list_calls':
        text = JSON.stringify(await calls.handleListCalls(args ?? {}));
        break;
      case 'get_call':
        text = JSON.stringify(await calls.handleGetCall(args ?? {}));
        break;
      case 'create_call':
        text = JSON.stringify(await calls.handleCreateCall(args ?? {}));
        break;
      case 'list_phone_numbers':
        text = JSON.stringify(await phoneNumbers.handleListPhoneNumbers());
        break;
      case 'get_phone_number':
        text = JSON.stringify(await phoneNumbers.handleGetPhoneNumber(args ?? {}));
        break;
      case 'list_tools':
        text = JSON.stringify(await vapiTools.handleListVapiTools());
        break;
      case 'get_tool':
        text = JSON.stringify(await vapiTools.handleGetVapiTool(args ?? {}));
        break;
      case 'list_presets':
        text = JSON.stringify(presets.handleListPresets());
        break;
      case 'create_assistant_from_preset':
        text = JSON.stringify(await presets.handleCreateAssistantFromPreset(args ?? {}));
        break;
      default:
        text = JSON.stringify({ message: 'Not implemented', tool: name });
    }
    return { content: [{ type: 'text', text }] };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const message = sanitizeErrorMessage(raw);
    logger.error('Tool error', { tool: name, message });
    return {
      content: [{ type: 'text', text: message }],
      isError: true,
    };
  }
}

export function createVapiMCPServer(): Server {
  assertAllToolsImplemented();
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: listTools(),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = await executeTool(name, args ?? undefined);
    return result;
  });

  return server;
}

export type VapiMCPServer = Server;
