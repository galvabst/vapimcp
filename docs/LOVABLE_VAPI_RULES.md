# Lovable: Vapi MCP Rules (multi-stage, all per MCP)

This doc describes how Vapi behavior rules work and what to set in Lovable so the agent follows them without pasting long rule text.

## MCP server URL (important)

When adding the Vapi MCP in Lovable, use **`https://<your-railway-domain>/sse`**. The path must be **`/sse`**, not `/mcp`. Using `/mcp` will cause "Connection failed".

## MCP first

All rules and detail come from the **Vapi MCP**. Lovable only needs a short instruction so the agent calls the right tool first and follows the returned rules.

## Call structure (core + on-demand)

1. **First call:** `get_vapi_behavior_rules()`  
   Returns the **core**: "Rules first", Quality Gate (Plan → then Create), MUST/SHOULD, Verboten, and a short architecture overview.  
   At the end it lists: **"When you need more detail, call:"** with exact tool calls for three topics.

2. **On-demand (when the agent needs more):**
   - `tools_documentation({ topic: "vapi_architecture_templates", depth: "full" })` – solution structure (Inbound/Outbound, assistants, tool flow, n8n).
   - `tools_documentation({ topic: "vapi_mandatory_build_process", depth: "full" })` – build order (no direct create without plan).
   - `tools_documentation({ topic: "vapi_output_contract", depth: "full" })` – response format (Goal, Plan, Tool List, Implementation, then tool calls).

Alternatively the agent can call `get_vapi_behavior_rules({ section: "templates" })` (or `build_process` / `output_contract`) to get the same content.

---

## Lovable Settings: Kurze Anleitung (what to enter once)

**Purpose:** One short block in Lovable (Custom Knowledge or Project Instruction) so the agent always does the right thing before building Vapi assistants or calls – without pasting full rules.

**Where to enter:** Lovable → Project → Settings → Custom Knowledge (one block) or Project Instruction.

### Copy-paste (English)

```
Vapi MCP usage: When the user asks to build or edit Vapi assistants or calls, always call the MCP tool get_vapi_behavior_rules() first (before any other Vapi tool in that conversation). Then follow the rules it returns: plan before create, no secrets. For architecture details or response format, use the "When you need more detail, call:" section in the rules.
```

### Copy-paste (Deutsch)

```
Vapi MCP: Wenn der User Vapi-Assistenten oder Calls bauen oder bearbeiten will, rufe immer zuerst das MCP-Tool get_vapi_behavior_rules() auf (bevor du ein anderes Vapi-Tool in dieser Konversation nutzt). Folge danach den zurückgegebenen Regeln: zuerst Plan, dann Erstellen; keine Secrets. Für Architektur-Details oder Antwortformat nutze den Abschnitt "When you need more detail, call:" in den Rules.
```

### What the agent will do

1. Before building/editing Vapi assistants or calls: call `get_vapi_behavior_rules()` once.
2. Follow the returned core rules (Quality Gate: plan before create; optional `vapi_health_check`).
3. When needed, use the calls listed in the rules (e.g. `tools_documentation({ topic: "vapi_architecture_templates", depth: "full" })` for structure, `vapi_output_contract` for response format).

No long rules in Lovable – only this short instruction; everything else comes from the MCP.
