const request = require("supertest");
const app = require("../index"); // Import your Express app

describe("Comments Service", () => {
  // Test creating a comment
  it("should create a new comment", async () => {
    const postResponse = await request(app)
      .post("/posts")
      .send({ text: "Test post", userId: "user_123" });

    const postId = postResponse.body.id;
    const response = await request(app)
      .post(`/posts/${postId}/comments`)
      .send({ text: "Test comment", userId: "user_456" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.text).toBe("Test comment");
  });

  // Test fetching comments for a post
  it("should fetch comments for a post", async () => {
    const postResponse = await request(app)
      .post("/posts")
      .send({ text: "Test post", userId: "user_123" });

    const postId = postResponse.body.id;
    await request(app)
      .post(`/posts/${postId}/comments`)
      .send({ text: "Test comment", userId: "user_456" });

    const response = await request(app).get(`/posts/${postId}/comments`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});