const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: { 
    type: String,
    required: [true, "Password is required"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { timestamps: true });

const AdminUser = mongoose.model("AdminUser", adminUserSchema);
module.exports = AdminUser;
