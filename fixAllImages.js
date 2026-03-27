import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    const db = mongoose.connection;

    // 🔥 IMPORTANT: change to frontend domain
    const OLD = "http://localhost:5000";
    const NEW = "https://girlswithwine.com";

    /* ================= BLOGS ================= */
    const blogs = await db.collection("blogs").updateMany(
      { imageUrl: { $regex: "localhost" } },
      [
        {
          $set: {
            imageUrl: {
              $replaceOne: {
                input: "$imageUrl",
                find: OLD,
                replacement: NEW,
              },
            },
          },
        },
      ]
    );

    console.log(`Blogs updated: ${blogs.modifiedCount}`);

    /* ================= REVIEWS ================= */
    const reviews = await db.collection("reviews").updateMany(
      { userImage: { $regex: "localhost" } },
      [
        {
          $set: {
            userImage: {
              $replaceOne: {
                input: "$userImage",
                find: OLD,
                replacement: NEW,
              },
            },
          },
        },
      ]
    );

    console.log(`Reviews updated: ${reviews.modifiedCount}`);

    /* ================= CITIES ================= */
    const cities = await db.collection("cities").updateMany(
      { imageUrl: { $regex: "localhost" } },
      [
        {
          $set: {
            imageUrl: {
              $replaceOne: {
                input: "$imageUrl",
                find: OLD,
                replacement: NEW,
              },
            },
          },
        },
      ]
    );

    console.log(`Cities updated: ${cities.modifiedCount}`);

    console.log("🔥 ALL IMAGE URLs FIXED");

    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

run();
