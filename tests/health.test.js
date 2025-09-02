const request = require("supertest");
const app = require("../src/server");

describe("Health Check", () => {
  test("GET /health - should return health status", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body).toHaveProperty("status", "OK");
    expect(response.body).toHaveProperty("environment");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("version");
  });
});
