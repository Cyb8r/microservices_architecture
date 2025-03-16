const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// Hardcoded service endpoints to forward events to
const SERVICE_URLS = [
  "http://posts-service:4000/events", // Posts service
  "http://comments-service:4001/events", // Comments service
  // Add more services here as needed
];

// Forward events to all services
app.post("/events", async (req, res) => {
  const event = req.body;

  try {
    console.log("Received Event:", event.type); // Log the event for debugging

    // Send the event to all services concurrently
    await Promise.all(
      SERVICE_URLS.map(url => axios.post(url, event).catch(err => {
        console.error(`Failed to send event to ${url}:`, err.message);
      }))
    );

    res.send({ status: "OK" });
  } catch (err) {
    console.error("Error processing event:", err.message);
    res.status(500).send({ status: "ERROR", message: "Failed to process event" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.send({ status: "UP" });
});

// Start the server
app.listen(4005, () => {
  console.log("Event Bus running on port 4005");
});