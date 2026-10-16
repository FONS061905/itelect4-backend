import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Location } from "./models/Location";
import { LOCATIONS } from "./data/locations";

// npm run seed. Run it once after the database is created, and again
// after anything that empties it. Nothing else in the project writes
// a location.
async function seed() {
  await connectDB();

  for (const location of LOCATIONS) {
    // upsert: update the row with this code, or insert it if there is
    // none. Running this a second time leaves three locations, not six.
    await Location.updateOne({ code: location.code }, location, {
      upsert: true,
    });
  }

  console.log(`${LOCATIONS.length} locations in ${mongoose.connection.name}`);

  // Without this the script never ends: the connection is an open
  // socket, and Node keeps running while one is still open.
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
