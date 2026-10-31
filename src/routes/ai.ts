// ===== GT5: a NEW file ==================================================
import { Router, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { ApiError } from "@google/genai";
import { requireAuth } from "../middleware/auth";
import { aiRequestSchema } from "../schemas/itemHelp";
import { helpWithItem, AiReplyError } from "../ai/gemini";

export const aiRouter = Router();

// Private, like items. Every call spends the Gemini quota, so an anonymous
// visitor must not be able to make one.
aiRouter.use(requireAuth);

// Five requests a minute per account. It sits below requireAuth, so
// req.userId exists by the time the limiter reads it. Counting by IP would
// put a whole campus Wi-Fi network into one shared count.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req: Request) => req.userId!,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Five requests a minute is the limit. Try again shortly.",
  },
});

aiRouter.use(aiLimiter);

// POST /api/ai
aiRouter.post("/", async (req: Request, res: Response) => {
  // safeParse, not parse: the 400 is written here, next to the rule it reports.
  const parsed = aiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues.map((issue) => issue.message),
    });
    return;
  }

  try {
    const help = await helpWithItem(parsed.data.prompt);
    res.json(help);
  } catch (err) {
    // 429 from Gemini means the quota of the Google project is used up.
    if (err instanceof ApiError && err.status === 429) {
      res.status(429).json({
        message: "The AI quota is used up for now. Try again later.",
      });
      return;
    }

    // Gemini refused, failed, or answered with something unusable. Log the
    // real reason; the browser gets one sentence and none of Google's text.
    if (err instanceof ApiError || err instanceof AiReplyError) {
      console.error(err);
      res.status(502).json({
        message: "The AI service did not answer properly. Try again.",
      });
      return;
    }

    // Anything else is a bug in this app: app.ts's error handler.
    throw err;
  }
});
