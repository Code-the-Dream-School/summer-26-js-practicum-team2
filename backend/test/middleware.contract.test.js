const request = require("supertest");
const app = require("../src/app");
const { authorizeRoles } = require("../src/middleware/jsonWebToken");

describe("middleware contracts", () => {
  it("allows an authenticated user with an authorized role", () => {
    const next = jest.fn();
    const middleware = authorizeRoles("admin");

    middleware({ user: { role: "admin" } }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("denies users without a permitted role", () => {
    const next = jest.fn();
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authorizeRoles("admin")({ user: { role: "learner" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied." });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns the JSON 404 contract for the retired hello route", async () => {
    // Confirm that the removed route is handled by the API 404 middleware.
    const res = await request(app).get("/api/hello");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: "Route GET /api/hello not found.",
    });
  });

  it("returns a stable JSON error payload for malformed JSON bodies", async () => {
    // Send intentionally broken JSON to make sure the parsing error is returned in the same format as the rest of the API errors.
    const res = await request(app)
      .post("/api/v1/users/login")
      .set("Content-Type", "application/json")
      .send('{"email":"broken@example.com",');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Malformed JSON request body.",
    });
  });

  it("applies core helmet security headers on API responses", async () => {
    // Use the root redirect because it does not require a database connection.
    const res = await request(app).get("/").redirects(0);

    expect(res.status).toBe(302);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["x-dns-prefetch-control"]).toBeDefined();
  });

  it("applies policy-oriented helmet headers on API responses", async () => {
    // Check the headers that control browser content and referrer policies on a root redirect.
    const res = await request(app).get("/").redirects(0);

    expect(res.status).toBe(302);
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["referrer-policy"]).toBeDefined();
  });
});
