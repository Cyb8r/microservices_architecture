const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Define the Post schema and model
const PostSchema = new mongoose.Schema({
  id: String,
  postId: String,
  text: String,
  userId: String,
});
const Post = mongoose.model("Post", PostSchema);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await Post.deleteMany(); // Clear the Post collection between tests
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Posts Service", () => {
  test("should create a new post", async () => {
    const post = new Post({ id: "1", postId: "123", text: "Test post", userId: "user1" });
    await post.save();

    const foundPost = await Post.findOne({ postId: "123" });
    expect(foundPost.text).toBe("Test post");
  });

  test("should fetch all posts", async () => {
    const post1 = new Post({ id: "1", postId: "123", text: "Test post 1", userId: "user1" });
    const post2 = new Post({ id: "2", postId: "456", text: "Test post 2", userId: "user2" });
    await post1.save();
    await post2.save();

    const posts = await Post.find();
    expect(posts.length).toBe(2);
  });

  test("should fetch a single post by postId", async () => {
    const post = new Post({ id: "1", postId: "123", text: "Test post", userId: "user1" });
    await post.save();

    const foundPost = await Post.findOne({ postId: "123" });
    expect(foundPost.text).toBe("Test post");
  });

  test("should return 404 for a non-existent post", async () => {
    const foundPost = await Post.findOne({ postId: "non-existent" });
    expect(foundPost).toBeNull();
  });
});