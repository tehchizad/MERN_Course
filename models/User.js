const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  UserSchema = new Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    avatar: { type: String },
    data: { type: Date, default: Date.now }
  });

module.exports = User = mongoose.model("users", UserSchema);
