import { Router, type Request, type Response } from "express";
import { Item } from "../models/Item";
import { requireAuth } from "../middleware/auth";
import type { NewItemBody } from "../types/index";

export const itemRouter = Router();

// Every route below needs a valid Authorization: Bearer <token>.
itemRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/items -- only the items this user reported, newest first
itemRouter.get("/", async (req: Request, res: Response) => {
  const items = await Item.find({
    reporterId: req.userId,
  }).sort({ createdAt: -1 });
  res.json(items);
});

// GET /api/items/:id
itemRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    // The right item AND the right reporter. Someone else's item gets
    // 404, not 403, so the id is never confirmed to exist.
    const item = await Item.findOne({
      _id: req.params.id,
      reporterId: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.json(item);
  },
);

// POST /api/items
itemRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewItemBody>,
    res: Response,
  ) => {
    const item = await Item.create({
      ...req.body,
      // Below the spread, so a reporterId in the body is overwritten.
      reporterId: req.userId,
    });

    res.status(201).json(item);
  },
);

// PATCH /api/items/:id
itemRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewItemBody>>,
    res: Response,
  ) => {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, reporterId: req.userId },
      { ...req.body, reporterId: req.userId },
      // returnDocument: "after" is Mongoose 9's name for { new: true }
      { returnDocument: "after", runValidators: true },
    );

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.json(item);
  },
);

// DELETE /api/items/:id
itemRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      reporterId: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.status(204).send();
  },
);
