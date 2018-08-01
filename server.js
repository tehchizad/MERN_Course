const express = require("express"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  passport = require("passport");

const users = require("./routes/api/users"),
  profile = require("./routes/api/profile"),
  posts = require("./routes/api/posts");

const app = express(),
  port = process.env.PORT || 5000,
  db = require("./config/keys").mongoURI;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(db)
  .then(() => console.log("MongoDB connection successful"))
  .catch(err => console.log(err));

app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () => console.log(`Server running on port ${port}`));
