const request = require("supertest");
const app = require("../index"); // Import your Express app

describe("Event Bus", () => {
  // Test receiving an event
  it("should receive an event", async () => {
    const response = await request(app)
      .post("/events")
      .send({ type: "TestEvent", data: { message: "Test message" } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "OK" });
  });
});