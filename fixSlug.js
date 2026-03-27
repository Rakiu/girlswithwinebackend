import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const City = mongoose.model(
      "City",
      new mongoose.Schema({}, { strict: false })
    );

    await City.updateMany({}, [
      {
        $set: {
          slug: {
            $concat: ["$permalink", "-", "$mainCity"]
          },
          canonicalUrl: {
            $concat: [
              "https://girlswithwine.com/",
              "$permalink",
              "-",
              "$mainCity"
            ]
          }
        }
      }
    ]);

    console.log("✅ Slugs updated");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
