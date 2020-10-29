let mongoose = require("mongoose");

let linkSchema = new mongoose.Schema({
  fileId: String,
  public_key: String,
  slug: String,
  fileName: String,
  createdOn: Date,
  type: String,
  size: String,
  fileType: String,
  downloads: Number,
  DDL: String,
});

module.exports = mongoose.model("Link", linkSchema);
