var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  designationId: String,
  lastLogin: { type: Date, default: Date.now() }
});

module.exports = mongoose.model("User", userSchema);
