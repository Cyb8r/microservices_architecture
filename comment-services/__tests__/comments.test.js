const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../index"); // Ensure this path is correct

let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create(); // Start in-memory MongoDB server
  const uri = mongoServer.getUri(); // Get the URI for the in-memory database
  await mongoose.connect(uri); // Connect Mongoose

  server = app.listen(4001); // Start the Express server
}, 20000); // Increase timeout for beforeAll

afterEach(async () => {
  await mongoose.connection.dropDatabase(); // Clear the database between tests
}, 15000); // Increase timeout for afterEach

afterAll(async () => {
  await mongoose.connection.close(); // Close the Mongoose connection
  await mongoServer.stop(); // Stop the in-memory MongoDB server
  await server.close(); // Close the Express server
}, 20000); // Increase timeout for afterAll

describe("Comments Service", () => {
  it("should create a new comment", async () => {
    const postResponse = await request(server)
      .post("/posts")
      .send({ text: "Test post", userId: "user_123" });

    const postId = postResponse.body.id;

    const commentResponse = await request(server)
      .post(`/posts/${postId}/comments`)
      .send({ text: "Test comment", userId: "user_456" });

    expect(commentResponse.status).toBe(201);
    expect(commentResponse.body.text).toBe("Test comment");
  });

  it("should fetch comments for a post", async () => {
    const postResponse = await request(server)
      .post("/posts")
      .send({ text: "Test post", userId: "user_123" });

    const postId = postResponse.body.id;

    await request(server)
      .post(`/posts/${postId}/comments`)
      .send({ text: "Test comment", userId: "user_456" });

    const commentsResponse = await request(server)
      .get(`/posts/${postId}/comments`);

    expect(commentsResponse.status).toBe(200);
    expect(commentsResponse.body.length).toBe(1);
    expect(commentsResponse.body[0].text).toBe("Test comment");
  });
});