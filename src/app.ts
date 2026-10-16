import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth";
import { itemRouter } from "./routes/items";
import { locationRouter } from "./routes/locations";
import { connectDB } from "./config/db";

export const app = express();

// Only the frontend's own address may read these replies in a browser.
// CORS_ORIGIN is the deployed frontend's URL (several can be given,
// separated by commas); without it, the local Vite dev server is allowed.
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ===== SESSION 10: the line that makes this work on Vercel ===========
// On your laptop, server.ts connects before any request arrives. On
// Vercel there is no startup step -- a request is the first thing that
// happens -- so every request waits here for the connection first.
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

// Opening the bare address in a browser shows what this API is instead
// of the 404 message.
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "itelect4-backend",
    description: "Lost & Found Tracker API",
    health: "/api/health",
    endpoints: ["/api/auth", "/api/locations", "/api/items"],
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/locations", locationRouter);
app.use("/api/items", itemRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler (4 arguments required)
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

// Vercel looks for an Express app in a few known places, and src/app.ts
// is one of them. A default export is all it needs, which is why this
// repo has no vercel.json.
export default app;
