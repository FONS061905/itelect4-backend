import type { Types } from "mongoose";

// FROM SESSION 1: the interfaces and enums, copied from itelect4-project's
// src/models.ts. The schemas in src/models/ are these written a second
// time, in a form the database can enforce.

export type UserRole = "student" | "security" | "admin";

export interface User {
  id: number;
  name: string;
  role: UserRole;
  contact?: string;
}

export type ItemType = "lost" | "found";

export enum ItemStatus {
  Reported = "reported",
  Claimed = "claimed",
  Verified = "verified",
  Returned = "returned",
}

export interface Item {
  id: number;
  title: string;
  type: ItemType;
  description: string;
  location: string;
  reporterId: number;
  status: ItemStatus;
  createdAt: string;
}

// The places on campus where an item can be lost or found. Like a course
// in the class demo, the code is its identity, so it has no id.
export interface Location {
  code: string;
  name: string;
  building: string;
  floor: number;
}

export enum ClaimStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface Claim {
  id: number;
  itemId: number;
  claimantId: number;
  reason?: string;
  status: ClaimStatus;
  createdAt: string;
}

// ---------------------------------------------------------------------
// What the database actually stores.
//
// Session 1 used `id: number` because the mock data numbered its own
// rows. MongoDB makes its own 24-character ids, so the stored shapes are
// DERIVED from the interfaces above with Omit instead of rewriting them.
// ---------------------------------------------------------------------

// The login needs an email and a password, which the frontend's User
// never had -- and the frontend must never receive the password.
export type UserDoc = Omit<User, "id"> & {
  email: string;
  isActive: boolean;
  password: string;
};

// reporterId points at a User document, so it is an ObjectId, not a
// number. createdAt is a real Date here; it only becomes a string in JSON.
export type ItemDoc = Omit<Item, "id" | "reporterId" | "createdAt"> & {
  reporterId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

// Location has no id to rename and nothing to leave out, but it still
// has to be a Pick: Omit and Pick produce a MAPPED type, which the
// toJSON transform's Record<string, unknown> accepts and an interface
// does not.
export type LocationDoc = Pick<
  Location,
  "code" | "name" | "building" | "floor"
>;

// What a client sends to create an item. No id and no reporterId --
// the server reads the reporter off the token instead.
export type NewItemBody = Pick<
  Item,
  "title" | "type" | "description" | "location" | "status"
>;
