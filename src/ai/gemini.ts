// ===== GT5: a NEW file ==================================================
import { GoogleGenAI, type Content } from "@google/genai";
import { MODEL, SYSTEM_PROMPT, EXAMPLES, wrap } from "./prompt";
import { itemHelpSchema, itemHelpJsonSchema, type ItemHelp } from "../schemas/itemHelp";

// Thrown when Gemini answered but the answer is unusable. The route turns
// it into a 502; anything else stays a 500.
export class AiReplyError extends Error {}

// The client is made on the first call, like connectDB: a missing key is a
// sentence on the first AI request, not a crash for every route.
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env, and to Vercel.");
  }
  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// The two examples become two finished exchanges, then the real description
// is the last turn. To the model it looks like a conversation it has had twice.
function buildContents(description: string): Content[] {
  const shots: Content[] = EXAMPLES.flatMap((example) => [
    { role: "user", parts: [{ text: wrap(example.description) }] },
    { role: "model", parts: [{ text: JSON.stringify(example.review) }] },
  ]);
  return [...shots, { role: "user", parts: [{ text: wrap(description) }] }];
}

export async function helpWithItem(description: string): Promise<ItemHelp> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      // JSON, in exactly this shape. No temperature here, on purpose:
      // Google's guide for the Gemini 3 models says to leave it at 1.0.
      responseMimeType: "application/json",
      responseJsonSchema: itemHelpJsonSchema,
    },
  });

  // Check 1: is there any text? (A reply blocked by safety filters has none.)
  const text = response.text;
  if (!text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  // Check 2: is it JSON?
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  // Check 3: does it match the schema? The schema was a request; this is the check.
  const result = itemHelpSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the schema");
  }
  return result.data;
}
