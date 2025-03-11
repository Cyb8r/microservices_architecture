const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index"); // Import your Express app
//const Post = require("../models/Post"); // Import Post model

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await Post.deleteMany(); // Clear database between tests
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Posts Service", () => {
  it("should create a new post", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ text: "Test post", userId: "user_123" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("postId"); // Fix: Validate postId instead of id
    expect(response.body.text).toBe("Test post");
  });

  it("should fetch all posts", async () => {
    await new Post({ id: "test1", postId: "p1", text: "First post", userId: "user_1" }).save();
    await new Post({ id: "test2", postId: "p2", text: "Second post", userId: "user_2" }).save();

    const response = await request(app).get("/posts");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty("postId");
  });

  it("should fetch a single post by postId", async () => {
    const createResponse = await request(app)
      .post("/posts")
      .send({ text: "Single post", userId: "user_123" });

    const postId = createResponse.body.postId; // Fix: Fetch postId, not id
    const response = await request(app).get(`/posts/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.postId).toBe(postId);
  });

  it("should return 404 for a non-existent post", async () => {
    const response = await request(app).get("/posts/nonexistent123");
    expect(response.status).toBe(404);
  });
});
