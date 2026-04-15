/**
 * search_knowledge — a minimal in-memory search over a sample knowledge base.
 *
 * Replace KNOWLEDGE with a call to your database, vector store, or API.
 * This example uses substring matching so you can run it without any setup.
 */

interface KnowledgeEntry {
  id: string;
  title: string;
  body: string;
  tags: string[];
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "mcp-basics",
    title: "MCP Basics",
    body: "The Model Context Protocol is an open standard for connecting AI assistants to tools, data, and context. Servers expose tools, resources, and prompts; clients invoke them.",
    tags: ["mcp", "protocol", "basics"],
  },
  {
    id: "arcanea-guardians",
    title: "Arcanea Guardians",
    body: "The Arcanea universe features 10 Guardians — Aiyami (Crown), Draconia (Fire), Lyria (Sight), Maylinn (Heart), Alera (Voice), Lyssandria (Foundation), Leyla (Flow), Elara (Starweave), Ino (Unity), Shinkami (Source).",
    tags: ["arcanea", "guardians", "lore"],
  },
  {
    id: "byok-pattern",
    title: "BYOK — Bring Your Own Key",
    body: "BYOK stores API keys in browser localStorage only. Keys flow via x-byok-* request headers at send time and are discarded after the provider call. Never persisted server-side.",
    tags: ["byok", "security", "pattern"],
  },
  {
    id: "liquid-glass",
    title: "LiquidGlass Primitive",
    body: "A 4-layer glass composition: noise texture + sheen sweep + 3D tilt + outer glow. Uses Framer Motion for tilt, CSS for noise and sheen.",
    tags: ["motion", "design", "glass"],
  },
];

export async function searchKnowledge(input: {
  query: string;
  limit?: number;
}): Promise<{ results: Array<{ id: string; title: string; excerpt: string; score: number }>; total: number }> {
  const { query, limit = 5 } = input;
  const q = query.toLowerCase().trim();
  if (!q) return { results: [], total: 0 };

  const scored = KNOWLEDGE.map((entry) => {
    const haystack = `${entry.title} ${entry.body} ${entry.tags.join(" ")}`.toLowerCase();
    // Simple scoring: count occurrences + 2x boost for title hits.
    const bodyHits = (haystack.match(new RegExp(q, "g")) || []).length;
    const titleHits = entry.title.toLowerCase().includes(q) ? 2 : 0;
    return { entry, score: bodyHits + titleHits };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    results: scored.map(({ entry, score }) => ({
      id: entry.id,
      title: entry.title,
      excerpt: entry.body.slice(0, 160) + (entry.body.length > 160 ? "…" : ""),
      score,
    })),
    total: scored.length,
  };
}
