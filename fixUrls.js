import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

console.log("Connected to DB...");

/* BLOG IMAGE URL FIX */
await db.collection("blogs").updateMany(
  { imageUrl: { $regex: "localhost" } },
  [
    {
      $set: {
        imageUrl: {
          $replaceOne: {
            input: "$imageUrl",
            find: "http://localhost:5000",
            replacement: "https://api4.girlswithwine.in"
          }
        }
      }
    }
  ]
);

/* CANONICAL URL FIX */
await db.collection("blogs").updateMany(
  { canonicalUrl: { $regex: "localhost" } },
  [
    {
      $set: {
        canonicalUrl: {
          $replaceOne: {
            input: "$canonicalUrl",
            find: "http://localhost:5000",
            replacement: "https://api4.girlswithwine.in"
          }
        }
      }
    }
  ]
);

console.log("All URLs updated ✅");

process.exit();
