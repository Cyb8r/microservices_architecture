const request = require("supertest");
const app = require("../index"); // Import your Express app

describe("Posts Service", () => {
  // Test creating a post
  it("should create a new post", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ text: "Test post", userId: "user_123" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.text).toBe("Test post");
  });

  // Test fetching all posts
  it("should fetch all posts", async () => {
    const response = await request(app).get("/posts");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test fetching a single post by ID
  it("should fetch a single post by ID", async () => {
    const createResponse = await request(app)
      .post("/posts")
      .send({ text: "Test post", userId: "user_123" });

    const postId = createResponse.body.id;
    const response = await request(app).get(`/posts/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(postId);
  });
});