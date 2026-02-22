/**
 * HTTP/SSE transport for Vapi MCP: GET /, GET /health, GET /sse, POST /messages.
 * For Railway deploy and Lovable connection.
 */

import express, { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createVapiMCPServer } from './mcp/server.js';
import type { SessionState } from './mcp/rules-guard.js';
import { isVapiConfigured, getOptionalMcpApiKey } from './config.js';
import { logger } from './lib/logger.js';

const SERVER_NAME = 'vapi-mcp';
const SERVER_VERSION = '1.0.0';
const startTime = Date.now();

let port = parseInt(process.env.PORT ?? '3000', 10);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  logger.warn('Invalid PORT, using 3000', { received: process.env.PORT });
  port = 3000;
}
const host = process.env.HOST ?? '0.0.0.0';

const transportsBySession: Record<string, SSEServerTransport> = {};

function bearerAuth(req: Request, res: Response, next: () => void): void {
  const apiKey = getOptionalMcpApiKey();
  if (!apiKey) {
    next();
    return;
  }
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (token !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

export async function startHttpServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/', (_req, res) => {
    res.json({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      endpoints: ['/health', '/sse'],
    });
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      vapiConfigured: isVapiConfigured(),
      version: SERVER_VERSION,
      uptime: Math.floor((Date.now() - startTime) / 1000),
    });
  });

  app.get('/sse', bearerAuth, async (req, res) => {
    const accept = req.headers.accept ?? '';
    if (!accept.includes('text/event-stream')) {
      res.status(400).json({ error: 'Accept: text/event-stream required' });
      return;
    }
    try {
      const sessionState: SessionState = { rulesAcknowledged: false };
      const transport = new SSEServerTransport('/messages', res);
      const sessionId = transport.sessionId;
      transportsBySession[sessionId] = transport;
      transport.onclose = () => {
        delete transportsBySession[sessionId];
      };
      const server = createVapiMCPServer(sessionState);
      await server.connect(transport);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('SSE setup failed', { error: msg });
      if (!res.headersSent) res.status(500).json({ error: 'SSE setup failed' });
    }
  });

  app.post('/messages', bearerAuth, async (req, res) => {
    const sessionId = req.query.sessionId as string | undefined;
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return;
    }
    const transport = transportsBySession[sessionId];
    if (!transport) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('POST /messages failed', { error: msg });
      if (!res.headersSent) res.status(500).json({ error: 'Message handling failed' });
    }
  });

  const server = app.listen(port, host, () => {
    logger.info(`${SERVER_NAME} HTTP listening`, { host, port });
  });

  const SHUTDOWN_TIMEOUT_MS = 10_000;
  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      timeoutId = null;
      logger.warn('Shutdown timeout reached, exiting');
      process.exit(0);
    }, SHUTDOWN_TIMEOUT_MS);
    server.close(() => {
      if (timeoutId) clearTimeout(timeoutId);
      for (const sid of Object.keys(transportsBySession)) {
        transportsBySession[sid]?.close().catch(() => {});
        delete transportsBySession[sid];
      }
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
