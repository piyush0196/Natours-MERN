const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Please provide a review"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // PARENT REFERENCING OF USER AND TOUR
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tours",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    // virtual property -> that is not stored in DB
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  // No needd to populate tour
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Review = new mongoose.model("Review", reviewSchema);
module.exports = Review;
