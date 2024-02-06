const User = require("../models/UserModel");
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  console.log(newObj);

  return newObj;
};

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

exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user update password
    if (req.body.password || req.body.confirmPassword) {
      return next(
        new AppError(
          "This route is not for password updates! Please use /updatePassword"
        ),
        400
      );
    }

    // 2) Filtered out unnwanted fieldnames which are not allowed to be upated [ex-admin]
    const filteredBody = filterObj(req.body, "name", "email");

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {user: updatedUser},
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(new AppError(err.message), 400);
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
