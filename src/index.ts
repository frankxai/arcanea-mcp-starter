#!/usr/bin/env node
/**
 * Arcanea MCP Starter
 *
 * A production-ready MCP server with 3 example tools and stdio transport.
 * Fork this, replace the tools with your own, and register with Claude
 * Desktop or any MCP client.
 *
 * Run:  npm run dev       (dev with watch)
 *       npm run build && npm start  (production)
 *       npm run inspect   (MCP Inspector for debugging)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchKnowledge } from "./tools/search-knowledge.js";
import { generateLore } from "./tools/generate-lore.js";
import { analyzeText } from "./tools/analyze-text.js";

// ─────────────────────────────────────────────────────────────────────
// Tool Registry
// ─────────────────────────────────────────────────────────────────────
// Each tool is { name, description, schema (Zod), handler (async fn) }.
// Add your own by appending to this array and creating src/tools/<name>.ts

const TOOLS = [
  {
    name: "search_knowledge",
    description:
      "Search the local knowledge base for entries matching a query. Returns ranked results with excerpts.",
    schema: z.object({
      query: z.string().describe("Search terms"),
      limit: z.number().int().positive().max(50).optional().default(5),
    }),
    handler: searchKnowledge,
  },
  {
    name: "generate_lore",
    description:
      "Generate a short mythic-voiced description for a subject. Useful for worldbuilding, fiction, and creative writing.",
    schema: z.object({
      subject: z.string().describe("What to describe"),
      tone: z
        .enum(["reverent", "ominous", "playful", "neutral"])
        .optional()
        .default("neutral"),
      max_sentences: z.number().int().positive().max(10).optional().default(3),
    }),
    handler: generateLore,
  },
  {
    name: "analyze_text",
    description:
      "Analyze text and return stats — word count, character count, reading time, sentiment hint, and top tokens.",
    schema: z.object({
      text: z.string().describe("The text to analyze"),
    }),
    handler: analyzeText,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────
// Server
// ─────────────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "arcanea-mcp-starter",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List all tools — MCP clients call this to discover what's available.
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.schema),
  })),
}));

// Route tool calls to the appropriate handler.
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = TOOLS.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  // Validate input against the Zod schema — MCP servers should be strict.
  const parsed = tool.schema.safeParse(request.params.arguments ?? {});
  if (!parsed.success) {
    return {
      content: [
        {
          type: "text",
          text: `Invalid input: ${parsed.error.message}`,
        },
      ],
      isError: true,
    };
  }

  try {
    const result = await tool.handler(parsed.data as never);
    return {
      content: [
        {
          type: "text",
          text:
            typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Tool error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
});

// ─────────────────────────────────────────────────────────────────────
// Minimal Zod → JSON Schema converter (no extra dep)
// ─────────────────────────────────────────────────────────────────────
// For production: consider `zod-to-json-schema` package for full spec coverage.
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      const zv = value as z.ZodTypeAny;
      properties[key] = zodToJsonSchema(zv);
      if (!(zv instanceof z.ZodOptional) && !(zv instanceof z.ZodDefault)) {
        required.push(key);
      }
    }
    return { type: "object", properties, required };
  }
  if (schema instanceof z.ZodString) {
    return { type: "string", description: schema.description };
  }
  if (schema instanceof z.ZodNumber) {
    return { type: "number", description: schema.description };
  }
  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean", description: schema.description };
  }
  if (schema instanceof z.ZodEnum) {
    return { type: "string", enum: schema.options };
  }
  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }
  if (schema instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(schema.removeDefault());
    return { ...inner, default: schema._def.defaultValue() };
  }
  if (schema instanceof z.ZodArray) {
    return { type: "array", items: zodToJsonSchema(schema.element) };
  }
  return {};
}

// ─────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // MCP servers communicate over stdio — never write to stdout manually.
  // Use stderr for logging so it doesn't break the protocol.
  console.error("[arcanea-mcp-starter] ready · 3 tools registered");
}

main().catch((err) => {
  console.error("[arcanea-mcp-starter] fatal:", err);
  process.exit(1);
});
