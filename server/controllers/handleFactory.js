const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/appError");

exports.deleteOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError("No document found with that ID", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      res.status(404).json({
        status: "Fail",
        error: error,
      });
    }
  };
};

exports.createOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);

      res.status(201).json({
        status: "success",
        data: doc,
      });
    } catch (error) {
      res.status(400).json({
        status: "Fail",
        error: error.message,
      });
      // next(new AppError(error.message, 400));
    }
  };
};

exports.updateOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        return next(new AppError("No documnent found with that ID", 404));
      }
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } catch (error) {
      res.status(404).json({
        status: "Fail",
        error: error,
      });
    }
  };
};

exports.getOne = (Model, populateOptions) => {
  return async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id);
      if (populateOptions) {
        query = query.populate(populateOptions);
      }
      const doc = await query;

      if (!doc) {
        return next(new AppError("No document found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {doc},
      });
    } catch (error) {
      // next(error);
      res.status(400).json({
        status: "Fail",
        error: error,
      });
    }
  };
};

exports.getAll = (Model) => {
  return async (req, res) => {
    try {
      // To get nested reviews (hack)
      let filter = {};
      if (req.params.tourId) {
        filter = {tour: req.params.tourId};
      }
      // EXECUTE QUERY

      // find({gte: 150, $lt: 300})
      const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const docs = await features.query;

      // SEND RESPONSE
      res.status(200).json({
        status: "success",
        results: docs.length,
        data: docs,
      });
    } catch (error) {
      res.status(404).json({
        status: "Fail",
        error: error.message,
      });
    }
  };
};
