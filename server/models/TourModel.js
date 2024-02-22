const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 chars"],
      minlength: [10, "A tour name must have more or equal than 10 chars"],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty must be either: easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be equal or more to 1.0"],
      max: [5, "Rating must be equal or less to 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this point to current doc when creating a new document (not updating)
          return val < this.price;
        },
        message: "Discount Price ({VALUE}) should be below the regular price",
      },
      // validate: [
      //     function (val) {
      //         // this point to current doc when creating a new document (not updating)
      //         return val < this.price
      //     }, 'Discount Price ({VALUE}) should be below the regular price'
      // ]
      // }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
    secretTour: Boolean,
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        //GeoJSON
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // Allowing virtual fields in response
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

// tourSchema.index({price: 1});
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});

// virtual property -> that is not stored in DB
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//  VIRTUAL POPULATING
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//DOCUMENT MIDDLEWARE: runs only before .save() and .create()
tourSchema.pre("save", function (next) {
  // this-> pointing to the current document
  this.slug = slugify(this.name, {lower: true});
  next();
});

tourSchema.post("save", function (doc, next) {
  // console.log(doc);
  next();
});

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // this-> pointing to the current query
  this.find({secretTour: {$ne: true}});
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-_v -passwordChangedAt",
  });
  next();
});

//AGGREGATE MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
  next();
});

const Tour = new mongoose.model("Tours", tourSchema);

module.exports = Tour;
