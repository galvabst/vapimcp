# Vapi MCP

MCP (Model Context Protocol) server that exposes Vapi APIs as tools: Assistants, Calls, Phone Numbers, Tools, and preset agents. Usable from Cursor, Claude Desktop, or Lovable over stdio (local) or HTTP/SSE (e.g. Railway).

## Prerequisites

- Node.js 20+
- Vapi account and [API key](https://dashboard.vapi.ai/org/api-keys)
- Optional: Railway account for deployment

## Quick Start (local)

```bash
npm install
npm run build
cp .env.example .env
# Edit .env: set VAPI_TOKEN
```

**Stdio (Cursor / Claude Desktop):**

```bash
MCP_MODE=stdio npm start
```

Configure your MCP client to run `node` with args `dist/index.js` and env `MCP_MODE=stdio` and `VAPI_TOKEN`.

**HTTP (local):**

```bash
MCP_MODE=http npm start
```

- `GET http://localhost:3000/` – name, version, endpoints
- `GET http://localhost:3000/health` – health (no secrets)
- `GET http://localhost:3000/sse` – SSE transport (for Lovable)

## Repo & deploy

- **GitHub:** [github.com/galvabst/vapimcp](https://github.com/galvabst/vapimcp) – clone, then push your local repo or connect for CI/CD.
- **Deploy on Railway:**
  1. Connect the GitHub repo; project root = repo root (where `Dockerfile` lives).
  2. **Variables (required):** `VAPI_TOKEN`. **Optional:** `MCP_MODE=http` (Docker defaults to HTTP), `MCP_API_KEY` (Bearer for Lovable). Do **not** set `PORT` – Railway injects it.
  3. **Health check:** Path = **/health** (Railway dashboard: Settings → Health Check).
  4. Generate a **public domain** (e.g. `https://vapi-mcp-xxx.railway.app`).

## Connect in Lovable

1. In Lovable: **Settings → Integrations → MCP Servers** (or equivalent).
2. **URL:** `https://<your-railway-domain>/sse` — **must end with `/sse`**, not `/mcp`. (This server has no `/mcp` route.)
3. If you set `MCP_API_KEY` on Railway, use **Authorization: Bearer &lt;MCP_API_KEY&gt;** in Lovable.
4. Save. Lovable can then use Vapi tools (list_assistants, create_call, etc.) for voice agents and outbound calls.
5. **Behavior rules (optional):** So the agent calls `get_vapi_behavior_rules()` first when building assistants/calls, add the short instruction from [docs/LOVABLE_VAPI_RULES.md](docs/LOVABLE_VAPI_RULES.md) to Custom Knowledge or Project Instruction.

## Cursor configuration

Add to `.cursor/mcp.json` (or your MCP config). Use the absolute path to your clone:

**Local (stdio):**

```json
{
  "mcpServers": {
    "vapi-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "<absolute-path-to-vapi-mcp>",
      "env": {
        "MCP_MODE": "stdio",
        "VAPI_TOKEN": "YOUR_VAPI_API_KEY"
      }
    }
  }
}
```

**Remote (after Railway deploy):** Use Lovable with the `/sse` URL, or in Cursor use `mcp-remote` pointing at `https://<railway-domain>/sse` with Bearer token if you set `MCP_API_KEY`.

## Tools

- **System:** `tools_documentation`, `get_vapi_behavior_rules`, `vapi_health_check`
- **Assistants:** `list_assistants`, `get_assistant`, `create_assistant`
- **Calls:** `list_calls`, `get_call`, `create_call`
- **Phone Numbers:** `list_phone_numbers`, `get_phone_number`
- **Tools (Vapi custom tools):** `list_tools`, `get_tool`
- **Presets (vorgefertigte Agents):** `list_presets`, `create_assistant_from_preset` (support, recruiting, appointment)

Call `tools_documentation` with no args for an overview, or with `topic` and `depth` for per-tool docs.

This MCP is standalone for building and managing Vapi voice agents. Assistant and phone number IDs can be used in create_call or in any external system (Lovable, Cursor, automation).

## Environment

See `.env.example`. Important: `VAPI_TOKEN`, `MCP_MODE`, `PORT`/`HOST`. Optional: `MCP_API_KEY`, `LOG_LEVEL`.

## Troubleshooting (Connection failed in Lovable)

- **URL must be** `https://<domain>/sse`. Using `.../mcp` returns 404 and causes "Connection failed".
- **Bearer token:** If `MCP_API_KEY` is set on Railway, enter the same value in Lovable (Bearer token / API key).
- **Health check:** Open `https://<domain>/health` in a browser; you should see `{"status":"ok",...}`. If not, the service may be down or the domain wrong.

## Security

- Never put `VAPI_TOKEN` or other secrets in frontend code.
- Keep credentials only in server environment variables.
- Do not commit `.env`; use `.env.example` as a template.

## Before you deploy

- [ ] `npm ci && npm run build` passes.
- [ ] `VAPI_TOKEN` set in deployment env (e.g. Railway variables).
- [ ] Health check path `/health` configured (Railway/other).
- [ ] Optional: `MCP_API_KEY` for HTTP/SSE if Lovable or remote MCP clients use the server.
