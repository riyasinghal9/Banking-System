const request = require("supertest");
const app = require("../src/server");

describe("Core Banking System API Tests", () => {
  let authToken;
  let customerId;
  let accountId;

  beforeAll(async () => {
    console.log("Setting up test environment...");
  });

  afterAll(async () => {
    console.log("Cleaning up test environment...");
  });

  describe("Health Check", () => {
    test("GET /health - should return health status", async () => {
      const response = await request(app)
        .get("/health")
        .expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("Authentication", () => {
    test("POST /api/auth/login - should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "john.doe",
          password: "password123"
        })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      
      authToken = response.body.token;
    });

    test("POST /api/auth/login - should fail with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "john.doe",
          password: "wrongpassword"
        })
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });

    test("POST /api/auth/login - should fail with missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "",
          password: "short"
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("details");
    });

    test("GET /api/auth/me - should return user info with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer " + authToken)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("user");
    });

    test("GET /api/auth/me - should fail without token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("Customer Management", () => {
    test("GET /api/customers - should require admin role", async () => {
      const response = await request(app)
        .get("/api/customers")
        .set("Authorization", "Bearer " + authToken)
        .expect(403);

      expect(response.body).toHaveProperty("success", false);
    });

    test("POST /api/customers - should require admin/teller role", async () => {
      const customerData = {
        first_name: "Test",
        last_name: "Customer",
        email: "test@example.com",
        phone: "+1234567890",
        address: "123 Test St",
        city: "Test City",
        state: "TS",
        zip_code: "12345"
      };

      const response = await request(app)
        .post("/api/customers")
        .set("Authorization", "Bearer " + authToken)
        .send(customerData)
        .expect(403);

      expect(response.body).toHaveProperty("success", false);
    });

    test("POST /api/customers - should fail with invalid data", async () => {
      const response = await request(app)
        .post("/api/customers")
        .set("Authorization", "Bearer " + authToken)
        .send({
          first_name: "",
          last_name: "",
          email: "invalid-email"
        })
        .expect(403);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("Error Handling", () => {
    test("GET /nonexistent - should return 404", async () => {
      const response = await request(app)
        .get("/nonexistent")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Route not found");
    });
  });
});
