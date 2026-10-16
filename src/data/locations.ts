import type { LocationDoc } from "../types/index";

// The campus locations the Report Item form offers. They are reference
// data: nobody creates a location through the API, so they live here
// and go into the database once, from src/seed.ts.
export const LOCATIONS: LocationDoc[] = [
  {
    code: "LIB2",
    name: "Library - 2nd floor",
    building: "Library",
    floor: 2,
  },
  {
    code: "MAINLOBBY",
    name: "Main Building - Lobby",
    building: "Main Building",
    floor: 1,
  },
  {
    code: "CAFETERIA",
    name: "Cafeteria",
    building: "Student Center",
    floor: 1,
  },
];
