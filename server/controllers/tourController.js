const Tour = require("../models/TourModel");
const factory = require("./handleFactory");

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  (req.query.sort = "-ratingsAverage,price"),
    (req.query.fields = "name,price,ratingsAverage,summary,difficulty");
  next();
};

const getAllTours = factory.getAll(Tour);

const getTour = factory.getOne(Tour, {path: "reviews"});
const addNewTour = factory.createOne(Tour);
const updateTour = factory.updateOne(Tour);
const deleteTour = factory.deleteOne(Tour);

const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage: {$gte: 4.5}},
      },
      {
        $group: {
          _id: {$toUpper: "$difficulty"},
          numRatings: {$sum: "$ratingsQuantity"},
          numTours: {$sum: 1},
          avgRating: {$avg: "$ratingsAverage"},
          avgPrice: {$avg: "$price"},
          minPrice: {$min: "$price"},
          maxPrice: {$max: "$price"},
        },
      },
      {
        $sort: {avgPrice: 1}, //ASC
      },
      // {
      //     $match: { _id: { $ne:'EASY' } }
      // }
    ]);

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      error: error.message,
    });
  }
};

const getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // YYYY-MM-DD
            $lte: new Date(`${year}-12-31`), // YYYY-MM-DD
          },
        },
      },
      {
        $group: {
          // group by months
          _id: {$month: "$startDates"},
          numToursStart: {$sum: 1},
          tours: {$push: "$name"},
        },
      },
      {
        $addFields: {month: "$_id"}, // add a field
      },
      {
        $project: {
          // 0,1 value -> hide/show key
          _id: 0,
        },
      },
      {
        $sort: {numToursStart: -1}, // DESC
      },
      {
        $limit: 12,
      },
    ]);

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      data: plan,
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      error: error.message,
    });
  }
};

module.exports = {
  addNewTour,
  deleteTour,
  aliasTopTours,
  getAllTours,
  getTour,
  updateTour,
  getTourStats,
  getMonthlyPlan,
};
