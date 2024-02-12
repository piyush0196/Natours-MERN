const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.authenticate,
    authController.restrictTo("user"),
    reviewController.addReview
  );

module.exports = router;
