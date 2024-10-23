const mongoose = require("mongoose");

const AdminUserSchema = new mongoose.Schema({
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
  role: {
    type: String,
    default: "user",
  },
});

const User = mongoose.model("AdminUser", AdminUserSchema);
module.exports = User;
