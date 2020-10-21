let mongoose = require("mongoose");

let linkSchema = new mongoose.Schema({
  fileId: String,
  fileName: String,
  createdOn: Date,
  downloads: Number,
});

module.exports = mongoose.model("Link", linkSchema);
