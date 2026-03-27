import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    const db = mongoose.connection;

    const OLD1 = "http://localhost:5000";
    const OLD2 = "https://api4.girlswithwine.in";
    const NEW = "https://girlswithwine.com";

    /* ================= BLOGS ================= */
    const blogs = await db.collection("blogs").updateMany(
      { imageUrl: { $regex: "localhost|api4.girlswithwine.in" } },
      [
        {
          $set: {
            imageUrl: {
              $replaceOne: {
                input: {
                  $replaceOne: {
                    input: "$imageUrl",
                    find: OLD1,
                    replacement: NEW,
                  },
                },
                find: OLD2,
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
      { userImage: { $regex: "localhost|api4.girlswithwine.in" } },
      [
        {
          $set: {
            userImage: {
              $replaceOne: {
                input: {
                  $replaceOne: {
                    input: "$userImage",
                    find: OLD1,
                    replacement: NEW,
                  },
                },
                find: OLD2,
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
      { imageUrl: { $regex: "localhost|api4.girlswithwine.in" } },
      [
        {
          $set: {
            imageUrl: {
              $replaceOne: {
                input: {
                  $replaceOne: {
                    input: "$imageUrl",
                    find: OLD1,
                    replacement: NEW,
                  },
                },
                find: OLD2,
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
