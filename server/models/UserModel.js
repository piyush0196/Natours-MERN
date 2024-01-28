const mongoose = require("mongoose");
const validator = require("validator");

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
    validator: {
      validate: function () {
        return this.password === this.confirmPassword;
      },
      message: "Password must be same",
    },
  },
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
