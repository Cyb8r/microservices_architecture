const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/posts");

// Define Post Schema and Model
const PostSchema = new mongoose.Schema({
  id: String,
  postId: String, // Unique postId
  text: String,
  userId: String,
});
const Post = mongoose.model("Post", PostSchema);

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    res.status(500).send({ message: "Error fetching posts", error: err.message });
  }
});

// Get a single post by postId
app.get("/posts/:postId", async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.postId });
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }
    res.send(post);
  } catch (err) {
    res.status(500).send({ message: "Error fetching post", error: err.message });
  }
});

// Create a new post
app.post("/posts", async (req, res) => {
  try {
    const id = randomBytes(4).toString("hex"); // Unique ID for the post
    const postId = randomBytes(4).toString("hex"); // Unique postId
    const userId = randomBytes(4).toString("hex"); // Unique userId for the post
    const { text } = req.body;

    const post = new Post({ id, postId, text, userId });
    await post.save();

    // Emit PostCreated event
    await axios.post("http://localhost:4005/events", {
      type: "PostCreated",
      data: { id, postId, text, userId },
    });

    res.status(201).send(post);
  } catch (err) {
    res.status(500).send({ message: "Error creating post", error: err.message });
  }
});

// Update a post (partial update)
app.patch("/posts/:postId", async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findOneAndUpdate(
      { postId: req.params.postId },
      { text },
      { new: true }
    );

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // Emit PostUpdated event
    await axios.post("http://localhost:4005/events", {
      type: "PostUpdated",
      data: { id: post.id, postId: post.postId, text: post.text, userId: post.userId },
    });

    res.send(post);
  } catch (err) {
    res.status(500).send({ message: "Error updating post", error: err.message });
  }
});

// Replace a post (full update or create if not exists)
app.put("/posts/:postId", async (req, res) => {
  try {
    const { text, userId } = req.body;

    const post = await Post.findOneAndReplace(
      { postId: req.params.postId },
      { id: randomBytes(4).toString("hex"), postId: req.params.postId, text, userId },
      { new: true, upsert: true } // Create the post if it doesn't exist
    );

    // Emit PostUpdated event
    await axios.post("http://localhost:4005/events", {
      type: "PostUpdated",
      data: { id: post.id, postId: post.postId, text: post.text, userId: post.userId },
    });

    res.send(post);
  } catch (err) {
    res.status(500).send({ message: "Error replacing post", error: err.message });
  }
});

// Delete a post
app.delete("/posts/:postId", async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ postId: req.params.postId });

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // Emit PostDeleted event
    await axios.post("http://localhost:4005/events", {
      type: "PostDeleted",
      data: { postId: req.params.postId },
    });

    res.send({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting post", error: err.message });
  }
});

// Handle incoming events
app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);
  res.send({ status: "OK" });
});

// Start the server
app.listen(4000, () => {
  console.log("Posts service running on port 4000");
});