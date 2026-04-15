/**
 * analyze_text — computes basic stats for a string.
 *
 * Stats:
 * - words, characters (with + without spaces)
 * - sentences (rough — splits on .!?)
 * - reading_time_minutes (at 225 wpm — standard English average)
 * - sentiment_hint (very rough keyword-based)
 * - top_tokens (top-5 non-stopword words)
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "i", "you", "he", "she", "it", "we", "they", "this", "that", "these", "those",
]);

const POSITIVE = ["great", "love", "best", "amazing", "wonderful", "good", "happy", "excellent", "brilliant"];
const NEGATIVE = ["bad", "hate", "worst", "awful", "terrible", "sad", "angry", "broken", "fail"];

export async function analyzeText(input: { text: string }): Promise<{
  characters: number;
  characters_no_spaces: number;
  words: number;
  sentences: number;
  reading_time_minutes: number;
  sentiment_hint: "positive" | "negative" | "neutral";
  top_tokens: Array<{ token: string; count: number }>;
}> {
  const text = input.text;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Sentiment — weighted count of positive/negative keywords.
  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;
  for (const w of POSITIVE) if (lower.includes(w)) pos++;
  for (const w of NEGATIVE) if (lower.includes(w)) neg++;
  const sentiment: "positive" | "negative" | "neutral" =
    pos > neg ? "positive" : neg > pos ? "negative" : "neutral";

  // Top tokens (non-stopword, lowercase, word boundary)
  const tokens = new Map<string, number>();
  for (const raw of words) {
    const token = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!token || STOPWORDS.has(token) || token.length < 3) continue;
    tokens.set(token, (tokens.get(token) ?? 0) + 1);
  }
  const top_tokens = Array.from(tokens.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([token, count]) => ({ token, count }));

  return {
    characters: text.length,
    characters_no_spaces: text.replace(/\s/g, "").length,
    words: words.length,
    sentences: sentences.length,
    reading_time_minutes: Math.round((words.length / 225) * 10) / 10,
    sentiment_hint: sentiment,
    top_tokens,
  };
}
