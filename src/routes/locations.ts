import { Router, type Request, type Response } from "express";
import { Location } from "../models/Location";

export const locationRouter = Router();

// There is no requireAuth line in this file, and that is the point.
// The location list is what the Report Item form needs before anybody
// picks one, so these two routes are public on purpose.

// GET /api/locations
locationRouter.get("/", async (_req: Request, res: Response) => {
  const locations = await Location.find().sort({ code: 1 });
  res.json(locations);
});

interface CodeParam {
  code: string;
}

// GET /api/locations/LIB2
locationRouter.get(
  "/:code",
  async (req: Request<CodeParam>, res: Response) => {
    const location = await Location.findOne({
      // The schema uppercases code on the way in, so /locations/lib2
      // has to be raised here too or it matches nothing.
      code: req.params.code.toUpperCase(),
    });

    if (!location) {
      res.status(404).json({
        message: `No location with code "${req.params.code}"`,
      });
      return;
    }

    res.json(location);
  },
);
