const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/UserModel");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });

    // LOGIN after signup
    const token = signToken(newUser._id);

    res.status(201).json({
      status: "Success",
      token,
      data: {user: newUser},
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.login = async (req, res, next) => {
  const {email, password} = req.body;

  // 1) Check if email & password exist
  if (!email || !password) {
    return next(new AppError("Please provide Email and Password!", 400));
  }

  // 2) check if user exits and password is correct
  const user = await User.findOne({email}).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or Password!", 401));
  }

  // 3) If everything OK, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      next(
        new AppError("You are not logged in! Please log in to get access", 401)
      );
    }

    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist!",
          401
        )
      );
    }

    // 4) Check if user changed password after JWT was issued
    freshUser.changePasswordAfter(decoded.iat);

    next();
  } catch (err) {
    next(new AppError(err.message, 401));
  }
};
