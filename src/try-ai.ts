// ===== GT5: a NEW file ==================================================
import "dotenv/config";
import { helpWithItem } from "./ai/gemini";

// npm run try-ai. One real request to Gemini from your terminal -- the same
// function POST /api/ai calls, with no Express, no token and no database.
// If this prints a report, the key, the model name and the schema all work.
async function tryAi() {
  const help = await helpWithItem(
    "A grey Samsung phone with a cracked corner and a clear case, " +
      "left on a table at the canteen around noon on Friday.",
  );
  console.log(JSON.stringify(help, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
