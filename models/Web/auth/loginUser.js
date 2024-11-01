const mongoose = require("mongoose");

const loginUserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    mobile_number: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    photoURL: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    googleVerified: {
      type: Boolean,
      default: false,
    },
    facebookVerified: {
      type: Boolean,
      default: false,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const LoginUser = mongoose.model("loginUser", loginUserSchema);
module.exports = LoginUser;
