/**
 * generate_lore — produces a mythic-voiced description for a subject.
 *
 * This is a deterministic template-based generator for the starter. In
 * production, replace the body with a call to your LLM of choice and use
 * the tone + max_sentences as prompt parameters.
 */

const OPENERS: Record<string, string[]> = {
  reverent: [
    "In the quiet of deep time,",
    "Before the first star sang,",
    "When the veil between worlds grew thin,",
  ],
  ominous: [
    "There are names you do not speak aloud.",
    "In the broken places of the world,",
    "Long buried beneath the surface,",
  ],
  playful: [
    "Picture this —",
    "Once upon a very strange morning,",
    "Legend has it —",
  ],
  neutral: [
    "Consider",
    "At the heart of it,",
    "Here is what we know:",
  ],
};

const CLOSERS = [
  "And so it remains, quietly reshaping what comes next.",
  "To see it clearly is to see yourself more clearly.",
  "Those who study it find themselves changed by the looking.",
  "It waits, as all such things wait, for the right eyes.",
];

export async function generateLore(input: {
  subject: string;
  tone?: "reverent" | "ominous" | "playful" | "neutral";
  max_sentences?: number;
}): Promise<{ text: string; tone: string; sentences: number }> {
  const tone = input.tone ?? "neutral";
  const max = input.max_sentences ?? 3;
  const subject = input.subject.trim();

  const opener = pick(OPENERS[tone]);
  const middle = `${subject} has gathered more stories than it has pages. Some speak of its origin in a single flash of attention; others insist it was woven slowly, from smaller things that already understood one another.`;
  const closer = pick(CLOSERS);

  const sentences = [opener + " " + middle.split(". ")[0] + ".", middle.split(". ")[1] + ".", closer].slice(
    0,
    max
  );

  return {
    text: sentences.filter(Boolean).join(" "),
    tone,
    sentences: sentences.length,
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
