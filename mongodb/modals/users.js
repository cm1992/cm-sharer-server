let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  guid: String,
  username: String,
  email: String,
  picture: String,
  joinedOn: Date,
});

module.exports = mongoose.model("User", userSchema);
