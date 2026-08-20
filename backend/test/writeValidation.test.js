const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const request = require("supertest");
const { useTestDb } = require("./setup");
const app = require("../src/app");
const { passwordSchema } = require("../src/validation/userValidation");

useTestDb();

// Create a valid bearer token so validation tests can reach protected endpoints.
const authHeader = () => ({
  Authorization: `Bearer ${jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), role: "learner" },
    process.env.JWT_SECRET,
  )}`,
});

// Reuse the common validation response checks across the different endpoints.
const expectValidationError = (response) => {
  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation error");
  expect(response.body.errors).toEqual(expect.any(Array));
  expect(response.body.errors.length).toBeGreaterThan(0);
};

describe("write endpoint input validation", () => {
  test("requires long passwords to include uppercase, lowercase, and numeric characters", () => {
    expect(passwordSchema.validate("YxNqSSe9uqCCVAEx").error).toBeUndefined();
    expect(passwordSchema.validate("longpasswordwithoutnumber").error).toBeDefined();
    expect(passwordSchema.validate("weakpass").error).toBeDefined();
  });

  test("rejects invalid lesson progress payloads", async () => {
    // Send the wrong type for moduleId along with a field the endpoint does not support.
    const response = await request(app)
      .patch("/api/v1/lessons/progress")
      .set(authHeader())
      .send({ moduleId: 42, unexpected: true });

    expectValidationError(response);
  });

  test("rejects quiz starts without a micro-lesson ID", async () => {
    // Leave out the required microLessonId before the request reaches quiz logic.
    const response = await request(app).post("/api/v1/quizzes/start").set(authHeader()).send({});

    expectValidationError(response);
    expect(response.body.errors.join(" ")).toContain("required");
  });

  test("rejects invalid quiz submission route parameters before grading", async () => {
    // Use an invalid micro-lesson route value so validation stops the request before grading.
    const response = await request(app)
      .post("/api/v1/quizzes/%20/submit")
      .set(authHeader())
      .send({});

    expectValidationError(response);
  });

  test("rejects invalid quiz submission bodies before database access", async () => {
    // Use an invalid attempt ID so the request is rejected before any database lookup is needed.
    const response = await request(app)
      .post("/api/v1/quizzes/1.1.1/submit")
      .set(authHeader())
      .send({ attemptId: "not-an-object-id" });

    expectValidationError(response);
  });
});
