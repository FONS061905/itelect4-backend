import { Schema, model } from "mongoose";
import { ItemStatus, type ItemDoc } from "../types/index";

const itemSchema = new Schema<ItemDoc>(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      minlength: [3, "title must be at least 3 characters"],
      maxlength: [100, "title must be at most 100 characters"],
    },
    type: {
      type: String,
      enum: { values: ["lost", "found"], message: "type must be lost or found" },
      required: [true, "type is required"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "description must be at most 500 characters"],
    },
    location: {
      type: String,
      required: [true, "location is required"],
      trim: true,
    },
    // Not a number any more: the _id of the User who reported it.
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ItemStatus),
        message: "status must be reported, claimed, verified or returned",
      },
      default: ItemStatus.Reported,
    },
  },
  { timestamps: true },
);

// Rename _id to id so the frontend keeps reading .id like it always has.
itemSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    ret.reporterId = String(ret.reporterId);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Item = model<ItemDoc>("Item", itemSchema);
