const Review = require("../models/ReviewModel");
const AppError = require("../utils/appError");

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find();

    res.status(200).json({
      status: "success",
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        review: newReview,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
