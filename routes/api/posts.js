const express = require("express"),
  router = express.Router(),
  mongoose = require("mongoose"),
  passport = require("passport");

const Post = require("../../models/Post"),
  Profile = require("../../models/Profile"),
  validatePostInput = require("../../validation/post");

//  @route  GET api/posts/test
//  @access Public
router.get("/test", (req, res) => res.json({ msg: "Posts slash test" }));

//  @route  GET api/posts
//  @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ error: "No posts found" }));
});

//  @route  GET api/posts/:id
//  @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ error: "No post found with that ID" }));
});

//  @route  POST api/posts
//  @access Private
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  let { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  let newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });
  newPost.save().then(post => res.json(post));
});

//  @route  DELETE api/posts/:id
//  @access Private
router.delete("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        // Verified owner of post
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ error: "This is not your post" });
        }
        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => res.status(404).json({ error: "Post not found" }));
  });
});

//  @route  POST api/posts/like/:id
//  @access Private
router.post("/like/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
          return res.status(400).json({ error: "You already like this post" });
        }
        post.likes.unshift({ user: req.user });
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ error: "Post not found" }));
  });
});

//  @route  POST api/posts/unlike/:id
//  @access Private
router.post("/unlike/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
          return res.status(400).json({ error: "You don't like this post" });
        }
        let removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ error: "Post not found" }));
  });
});

//  @route  POST api/posts/comment/:id
//  @access Private
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  let { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then(post => {
      let newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };
      post.comments.unshift(newComment);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json(err));
});

//  @route  DELETE api/posts/comment/:id/:comment_id
//  @access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(comment => comment._id.toString() === req.params.comment_id)
            .length === 0
        ) {
          return res.status(404).json({ error: "Comment not found" });
        }
        let removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;
