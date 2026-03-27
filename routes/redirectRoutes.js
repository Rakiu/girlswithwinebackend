import express from "express";
import { redirectToCanonical } from "../controllers/redirectController.js";
import City from "../models/City.js";

const router = express.Router();

router.get("/call-girls/:state/:city", redirectToCanonical);
router.get("/city/:city", redirectToCanonical);

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const data = await City.findOne({ slug });

    if (!data) return res.status(404).send("Not Found");

    return res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

export default router;
