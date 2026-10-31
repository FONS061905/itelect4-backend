// GT6 backend test: Supertest sends real HTTP requests to the real
// Express app, without opening a port and without a database.
import "dotenv/config"; // reads .env on your laptop; GitHub has none, and CI sets JWT_SECRET itself
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app";

// app.ts waits for connectDB() before every route. There is no database
// on your laptop's test run or on GitHub's machine, so this replaces the
// connection module for this test file only, with one that does nothing.
vi.mock("../src/config/db", () => ({
  connectDB: async () => {},
}));

// A token made the way POST /api/auth/login makes one: the same payload
// shape, signed with the same JWT_SECRET. The user does not have to exist,
// because requireAuth only checks the signature.
const REPORTER_ID = "665f1c2ab4e8d3a1f0c9e001"; // a valid ObjectId

function tokenFor(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  });
}

describe("POST /api/items", () => {
  it("answers 401 when there is no token", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ title: "Blue umbrella", type: "lost", location: "Library" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "No token. Send Authorization: Bearer <token>",
    );
  });

  it("answers 401 when the token was signed with another secret", async () => {
    const forged = jwt.sign({ userId: REPORTER_ID }, "not-the-secret");

    const res = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${forged}`)
      .send({ title: "Blue umbrella", type: "lost", location: "Library" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is invalid or has expired");
  });

  it("lets a valid token through, then checks the body", async () => {
    // An empty body fails the Item schema's required fields. Mongoose
    // refuses it before any database call, so no connection is needed.
    const res = await request(app)
      .post("/api/items")
      .set("Authorization", `Bearer ${tokenFor(REPORTER_ID)}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toContain("title is required");
    expect(res.body.errors).toContain("location is required");
  });
});
