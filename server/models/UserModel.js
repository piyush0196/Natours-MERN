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

const User = new mongoose.model("User", userSchema);

module.exports = User;
