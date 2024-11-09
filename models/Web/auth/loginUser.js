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
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    mobile: {
      type: String,
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
      sparse: true,
    },
    password: {
      type: String,
    },
    mobileVerified : {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      sparse: true,
    },
    photoURL: {
      type: String,
    },
    firebaseSignup: {
      type: Boolean,
      default: false,
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
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Optional: Compound unique index for email and mobile
loginUserSchema.index({ email: 1 }, { unique: true });

const LoginUser = mongoose.model("loginUser", loginUserSchema);
module.exports = LoginUser;
