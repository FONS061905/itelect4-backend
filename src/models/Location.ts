import { Schema, model } from "mongoose";
import type { LocationDoc } from "../types/index";

// The Location interface, written a second time as a schema. Locations
// are the one thing this API serves to somebody who is not logged in.
const locationSchema = new Schema<LocationDoc>({
  // unique is the reason GET /api/locations/LIB2 can use findOne and be
  // sure there is nothing else it could have matched.
  code: {
    type: String,
    required: [true, "code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },

  name: { type: String, required: [true, "name is required"], trim: true },

  building: { type: String, required: true, trim: true },

  // Ground floor is 1; the tallest building on campus has 6.
  floor: { type: Number, required: true, min: 1, max: 6 },
});

// Location never had an id -- the code is its identity -- so there is
// nothing to rename, only the two fields Mongo added to take out.
locationSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Location = model<LocationDoc>("Location", locationSchema);
