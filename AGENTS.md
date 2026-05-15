# arcanea-mcp-starter — AGENTS.md

Starter template for MCP servers.

## Harness

- Manifest: `.agent-harness.json`
- Risk: template
- Deploy policy: none
- Health: `pnpm dev`
- Agent files: `AGENTS.md`, `CLAUDE.md`
- Global hooks: disabled.

## Operating Rules

1. Keep MCP server examples explicit about inputs, outputs, and permissions.
2. Do not include live credentials or private connector tokens.
3. Avoid hidden global dependencies; templates must work after a fresh clone.
4. Validate with the package scripts present in this repo.

