const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    location : {
      type : String,
      default: "Kurnool",
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

const AdminUser = mongoose.model("AdminUser", adminUserSchema);
module.exports = AdminUser;
