const User = require("../models/UserModel");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/appError");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      data: {users},
    });
  } catch (error) {
    next(AppError("Unablet to process request", 400));
  }
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

// module.exports = {
//     getAllUsers,
//     createUser,
//     updateUser,
//     deleteUser,
//     getUser
// }
