import { z } from "zod";

// ===== GT5: what a client may send to POST /api/ai =====================
// Checked before anything is sent to Gemini, because every request that
// reaches Gemini is counted against the quota -- a request that was never
// going to work should cost nothing.
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe your item in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
});

// ===== GT5: what Gemini has to send BACK ===============================
// One schema, used three ways:
//   1. z.infer below turns it into the ItemHelp type for TypeScript.
//   2. z.toJSONSchema at the bottom turns it into the JSON Schema that is
//      sent to Gemini with every request.
//   3. itemHelpSchema.safeParse in src/ai/gemini.ts checks the reply.
// .describe() is not a comment: the text travels to Gemini inside the
// JSON Schema and tells the model what each field is for.
export const CATEGORIES = [
  "bag",
  "electronics",
  "clothing",
  "keys",
  "documents",
  "other",
] as const;

export const itemHelpSchema = z.object({
  summary: z
    .string()
    .describe("One sentence restating the lost or found item in plain words."),
  category: z
    .enum(CATEGORIES)
    .describe("The closest category for the item."),
  tags: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("Short search words someone would use to find it: colour, brand, material."),
  improvements: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Concrete details to add before posting, so the owner can be matched."),
  readiness: z
    .enum(["ready", "almost", "not-yet"])
    .describe("How close the report is to being posted."),
});

export type ItemHelp = z.infer<typeof itemHelpSchema>;

// Computed once, when this file is first imported -- not per request.
export const itemHelpJsonSchema = z.toJSONSchema(itemHelpSchema);
