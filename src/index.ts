import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createVapiMCPServer } from './mcp/server.js';
import { logger } from './lib/logger.js';

process.on('uncaughtException', (err) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error('uncaughtException', { message });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  logger.error('unhandledRejection', { message });
  process.exit(1);
});

async function main(): Promise<void> {
  const mode = process.env.MCP_MODE ?? (process.env.NODE_ENV === 'production' ? 'http' : 'stdio');
  if (mode === 'stdio') {
    const transport = new StdioServerTransport();
    const server = createVapiMCPServer();
    await server.connect(transport);
    return;
  }
  const { startHttpServer } = await import('./http-server.js');
  await startHttpServer();
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error('main failed', { message });
  process.exit(1);
});
