const Review = require("../models/ReviewModel");
const AppError = require("../utils/appError");
const factory = require("./handleFactory");

exports.addReview = async (req, res, next) => {
  if (!req.params.tourId) {
    return next(new AppError("Please provide tour id", 400));
  }
  try {
    const newReview = await Review.create({
      review: req.body.review,
      rating: req.body.rating,
      user: req.user.id,
      tour: req.params.tourId,
    });

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

exports.getAllReviews = factory.getAll(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
