const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  ProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "users" },
    handle: { type: String, require: true, max: 40 },
    company: { type: String },
    website: { type: String },
    locations: { type: String },
    status: { type: String, required: true },
    skills: { type: [String], required: true },
    bio: { type: String },
    github: { type: String },
    experience: [
      {
        title: { type: String, require: true },
        company: { type: String, require: true },
        location: { type: String },
        from: { type: Date, require: true },
        to: { type: String },
        current: { type: Boolean, default: false },
        description: { type: String }
      }
    ],
    education: [
      {
        school: { type: String, require: true },
        degree: { type: String, require: true },
        fieldofstudy: { type: String, required: true },
        from: { type: Date, require: true },
        to: { type: String },
        current: { type: Boolean, default: false },
        description: { type: String }
      }
    ],
    social: {
      youtube: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      linkedin: { type: String },
      instagram: { type: String }
    },
    date: { type: Date, default: Date.now }
  });

module.exports = Profile = mongoose.model("profile", ProfileSchema);
