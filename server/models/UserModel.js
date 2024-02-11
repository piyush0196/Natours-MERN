const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid Email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Pasword is required"],
    minLenght: [8, "Password must be atleast 8 chars"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Pasword is required"],
    validate: {
      // This only works on CREATE & SAVE!!!
      validator: function (el) {
        // el => confirmPassword
        return el === this.password;
      },
      message: "Password must be same",
    },
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//DOCUMENT MIDDLEWARE: runs only before .save() and .create()
userSchema.pre("save", async function (next) {
  //  only run if password is modified
  if (!this.isModified("password")) return next();

  // 1) hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // 2) Delete confirmPassword (don't want to save it in DB)
  this.confirmPassword = undefined;

  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({active: {$ne: false}});
  next();
});

// Instance method => Available for all user documents
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JwtTimestamp) {
  const changedTimestamp = parseInt(
    this.passwordChangedAt?.getTime() / 1000,
    10
  ); // in sec

  // this point to document
  if (this.passwordChangedAt) {
    // true => Password is changed by the user
    return JwtTimestamp < changedTimestamp;
  }

  // False means password NEVER changed by user
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // encrypting to store in DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // now + 10 mins in ms

  return resetToken;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
