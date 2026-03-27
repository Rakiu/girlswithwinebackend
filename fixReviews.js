import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

console.log("Connected to DB...");

/* REVIEW IMAGE URL FIX */
const result = await db.collection("reviews").updateMany(
  { userImage: { $regex: "localhost" } },
  [
    {
      $set: {
        userImage: {
          $replaceOne: {
            input: "$userImage",
            find: "http://localhost:5000",
            replacement: "https://api4.girlswithwine.in"
          }
        }
      }
    }
  ]
);

console.log("Reviews Updated:", result.modifiedCount);

process.exit();
