import Review from "../models/Review.js";
import Girl from "../models/Girl.js";

/* =============================
   ADD REVIEW
============================= */
export const addReview = async (req, res) => {
  try {

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const { girlId, userName, comment } = req.body;
    const rating = parseInt(req.body.rating);

    if (!girlId || !userName || !rating) {
      return res.status(400).json({
        message: "girlId, userName and rating required"
      });
    }

    const girl = await Girl.findById(girlId);

    if (!girl) {
      return res.status(404).json({
        message: "Girl not found"
      });
    }

    let userImage = "";

    /* IMAGE SAVE SAME AS GIRL CONTROLLER */

    if (req.file) {
      userImage = `${baseUrl}/uploads/reviews/${req.file.filename}`;
    }

    const review = await Review.create({
      girl: girlId,
      userName,
      comment,
      rating,
      userImage,
      status: "Pending"
    });

    res.json({
      message: "Review submitted. Waiting for approval",
      data: review
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   GET ALL REVIEWS (ADMIN)
============================= */
export const getAllReviews = async (req, res) => {
  try {

    const reviews = await Review.find()
      .populate({
        path: "girl",
        select: "name imageUrl rating"
      })
      .sort({ createdAt: -1 });

    res.json(reviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =============================
   GET APPROVED REVIEWS BY GIRL
============================= */
export const getReviewsByGirl = async (req, res) => {
  try {

    const reviews = await Review.find({
      girl: req.params.girlId,
      status: "Approved"
    }).sort({ createdAt: -1 });

    res.json(reviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =============================
   APPROVE REVIEW
============================= */
export const approveReview = async (req, res) => {
  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    review.status = "Approved";
    await review.save();

    /* UPDATE GIRL RATING */

    const stats = await Review.aggregate([
      { $match: { girl: review.girl, status: "Approved" } },
      {
        $group: {
          _id: "$girl",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const avgRating = stats[0]?.avgRating || 0;
    const totalReviews = stats[0]?.totalReviews || 0;

    await Girl.findByIdAndUpdate(review.girl, {
      rating: avgRating.toFixed(1),
      totalReviews
    });

    res.json({
      message: "Review approved"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =============================
   REJECT REVIEW
============================= */
export const rejectReview = async (req, res) => {
  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    review.status = "Rejected";
    await review.save();

    res.json({
      message: "Review rejected"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =============================
   DELETE REVIEW
============================= */
export const deleteReview = async (req, res) => {
  try {

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      message: "Review deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =============================
   TOP REVIEWS (LANDING PAGE)
============================= */
export const getTopReviews = async (req, res) => {
  try {

    const reviews = await Review.find({
      status: "Approved"
    })
      .populate({
        path: "girl",
        select: "name imageUrl imageAlt nameSlug seoSlug permalink"

      })
      .sort({ rating: -1, createdAt: -1 }) 
      .limit(3);

    res.json(reviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};