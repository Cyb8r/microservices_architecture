const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/comments");

// Define Comment Schema and Model
const CommentSchema = new mongoose.Schema({
  id: String,
  text: String,
  userId: String,
  postId: String, // Link to the post
});
const Comment = mongoose.model("Comment", CommentSchema);

// Get all comments
app.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.send(comments);
  } catch (err) {
    res.status(500).send({ message: "Error fetching comments", error: err.message });
  }
});

// Get comments for a specific post
app.get("/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId });
    res.send(comments);
  } catch (err) {
    res.status(500).send({ message: "Error fetching comments for post", error: err.message });
  }
});

// Get a single comment by commentId
app.get("/comments/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findOne({ id: req.params.commentId });
    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.send(comment);
  } catch (err) {
    res.status(500).send({ message: "Error fetching comment", error: err.message });
  }
});

// Create a new comment for a specific post
app.post("/posts/:postId/comments", async (req, res) => {
  try {
    const id = randomBytes(4).toString("hex"); // Unique ID for the comment
    const { text } = req.body;
    const postId = req.params.postId; // Get postId from the URL

    // Fetch the post to get the userId
    let post;
    try {
      const response = await axios.get(`http://localhost:4000/posts/${postId}`);
      post = response.data;
      if (!post) {
        return res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).send({ message: "Post not found" });
      }
      throw err; // Re-throw other errors
    }

    // Use the userId from the post
    const userId = post.userId;

    const comment = new Comment({ id, text, userId, postId });
    await comment.save();

    // Emit CommentCreated event
    await axios.post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: { id, text, userId, postId },
    });

    res.status(201).send(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).send({ message: "Error creating comment", error: err.message });
  }
});

// Update a comment (partial update)
app.patch("/comments/:commentId", async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findOneAndUpdate(
      { id: req.params.commentId },
      { text },
      { new: true }
    );

    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    // Emit CommentUpdated event
    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: { id: comment.id, text: comment.text, userId: comment.userId, postId: comment.postId },
    });

    res.send(comment);
  } catch (err) {
    res.status(500).send({ message: "Error updating comment", error: err.message });
  }
});

// Replace a comment (full update or create if not exists)
app.put("/comments/:commentId", async (req, res) => {
  try {
    const { text, userId, postId } = req.body;

    const comment = await Comment.findOneAndReplace(
      { id: req.params.commentId },
      { id: req.params.commentId, text, userId, postId },
      { new: true, upsert: true } // Create the comment if it doesn't exist
    );

    // Emit CommentUpdated event
    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: { id: comment.id, text: comment.text, userId: comment.userId, postId: comment.postId },
    });

    res.send(comment);
  } catch (err) {
    res.status(500).send({ message: "Error replacing comment", error: err.message });
  }
});

// Delete a comment
app.delete("/comments/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ id: req.params.commentId });

    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    // Emit CommentDeleted event
    await axios.post("http://localhost:4005/events", {
      type: "CommentDeleted",
      data: { id: req.params.commentId },
    });

    res.send({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting comment", error: err.message });
  }
});

// Handle incoming events
app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);
  res.send({ status: "OK" });
});

// Start the server
app.listen(4001, () => {
  console.log("Comments service running on port 4001");
});