const {promisify} = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../models/UserModel");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
const bcrypt = require("bcryptjs");
const {urlencoded} = require("body-parser");

// ROLE - Create a new Token
const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// ROLE - To send user & token in response
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expiresIn: process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOption.secure = true;
  //sending JWT in cookie
  res.cookie("jwt", token, cookieOption);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "Success",
    token,
    data: {user},
  });
};

exports.signup = async (req, res, next) => {
  try {
    // Adding new user in DB
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      confirmPassword: req.body.confirmPassword,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    // LOGIN after signup
    createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 200, res);
};

// ROLE - Check if user is AUTHENTICATED
exports.authenticate = async (req, res, next) => {
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
    if (freshUser.changePasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password! Please login again.", 401)
      );
    }

    // Grant access to protected route
    req.user = freshUser;
    next();
  } catch (err) {
    next(new AppError(err.message, 401));
  }
};

// ROLE - Checking permission based on role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action! ", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
      return next(new AppError("User not found!", 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    //save data
    await user.save({validateModifiedOnly: true});

    // 3) Sent it to user's email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Click on the Reset password link to set a new password. ${resetUrl}\nPlease ignore if you didn't forgot your password.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset link (Only valid for 10 mins)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      //save data
      await user.save({validateModifiedOnly: true});

      return next(
        new AppError("Email could not be sent! Please try again later.", 500)
      );
    }
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {$gt: Date.now()},
    });

    // 2) If tokens has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError("Token is inavlid or has expired!", 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3) Update changePasswordAt property of user
    user.changePasswordAt = Date.now() - 1000;

    // 4) Log the user in, send JWT
    createAndSendToken(user, 201, res);
  } catch (err) {
    next(new AppError(err.message));
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from the collecton
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if current password is correct
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return next(new AppError("Incorrect current password!", 401));
    }

    // 3) If so, then update the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.changePasswordAt = Date.now();
    await user.save();

    // 4) Log user in, send JWT
    createAndSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message));
  }
};
