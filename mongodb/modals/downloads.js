let mongoose = require("mongoose");

let downloadSchema = new mongoose.Schema({
  fileId: String,
  fileName: String,
  userId: String,
  date: Date,
});

module.exports = mongoose.model("Download", downloadSchema);
