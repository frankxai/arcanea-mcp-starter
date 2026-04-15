# Arcanea MCP Starter

Production-ready [Model Context Protocol](https://modelcontextprotocol.io) server starter. **SDK 1.29**, **3 example tools**, stdio transport, TypeScript strict, zero required env vars.

Fork this repo, replace the tools with your own, and register with Claude Desktop or any MCP client in minutes.

## What's Included

| Tool | What it does |
|------|-------------|
| **search_knowledge** | Substring search over an in-memory knowledge base with relevance scoring |
| **generate_lore** | Mythic-voiced description generator with tone control |
| **analyze_text** | Text stats — word/char/sentence count, reading time, sentiment hint, top tokens |

Plus: full Zod input validation, structured error handling, MCP Inspector support, and a minimal Zod-to-JSON-Schema converter (no extra deps).

## Quick Start

```bash
git clone https://github.com/frankxai/arcanea-mcp-starter.git
cd arcanea-mcp-starter
pnpm install
pnpm run build
```

## Register with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "arcanea-starter": {
      "command": "node",
      "args": ["/absolute/path/to/arcanea-mcp-starter/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. You'll see 3 new tools in the tools menu.

## Debug with MCP Inspector

```bash
pnpm run inspect
```

Opens the official MCP Inspector UI at `http://localhost:5173` — test every tool, inspect schemas, see raw request/response.

## Architecture

```
src/
  index.ts              # Server bootstrap + tool registry + Zod→JSON schema
  tools/
    search-knowledge.ts # One tool per file — clean, focused, testable
    generate-lore.ts
    analyze-text.ts
```

The **tool registry pattern** (`TOOLS` array in `index.ts`) is the core idea — each entry is `{ name, description, schema (Zod), handler (async fn) }`. Add a new tool:

1. Create `src/tools/my-tool.ts` exporting an async function
2. Import it in `src/index.ts`
3. Append `{ name, description, schema, handler }` to the `TOOLS` array

That's it. The dispatcher, validation, and JSON Schema generation work automatically.

## Tool Development Checklist

- [ ] Input schema uses Zod with `.describe()` on every field
- [ ] Handler returns a serializable object (will be `JSON.stringify`-ed)
- [ ] Errors throw or return `isError: true` — don't crash the server
- [ ] No stdout logging — MCP uses stdout for protocol. Use `console.error` for logs.
- [ ] Tool is pure where possible — if it hits a network, document the cost/rate

## Stack

- **TypeScript** strict mode, NodeNext module resolution
- **@modelcontextprotocol/sdk** ^1.29.0 (April 2026)
- **Zod** for schema validation
- **tsx** for dev watch mode
- **Node 20+**

## License

MIT — fork freely, build your own tools, ship to your users.

---

Built by [Arcanea](https://arcanea.ai) · [More templates](https://github.com/frankxai/arcanea-templates)
