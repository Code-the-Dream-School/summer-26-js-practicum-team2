const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const request = require("supertest");
const { useTestDb } = require("./setup");
const app = require("../src/app");
const {
  registerSchema,
  passwordSchema,
  lessonProgressSchema,
  quizSubmissionSchema,
} = require("../src/validation/userValidation");

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
  test("accepts supported password policy variants while rejecting weak passwords", () => {
    expect(passwordSchema.validate("YxNqSSe9uqCCVAEx").error).toBeUndefined();
    expect(passwordSchema.validate("StrongPass1!").error).toBeUndefined();
    expect(passwordSchema.validate("longpasswordwithoutnumber").error).toBeDefined();
    expect(passwordSchema.validate("Password1 ").error).toBeDefined();
    expect(passwordSchema.validate("weakpass").error).toBeDefined();
  });

  test("accepts matching trimmed register passwords", () => {
    const { error } = registerSchema.validate({
      name: "Learner",
      email: "learner@example.com",
      password: " StrongPass1! ",
      confirmPassword: " StrongPass1! ",
      tos: true,
    });

    expect(error).toBeUndefined();
  });

  test("rejects unknown lesson progress fields", async () => {
    const response = await request(app)
      .patch("/api/v1/lessons/progress")
      .set(authHeader())
      .send({ lessonId: "1.1", unexpected: true });

    expectValidationError(response);
    expect(response.body.errors.join(" ")).toContain("unexpected");
  });

  test("requires a lesson or micro-lesson ID", async () => {
    const response = await request(app)
      .patch("/api/v1/lessons/progress")
      .set(authHeader())
      .send({ moduleId: "cashFlow" });

    expectValidationError(response);
  });

  test("rejects invalid lesson progress module IDs", async () => {
    const response = await request(app)
      .patch("/api/v1/lessons/progress")
      .set(authHeader())
      .send({ moduleId: 42, lessonId: "1.1" });

    expectValidationError(response);
  });

  test("rejects quiz starts without a micro-lesson ID", async () => {
    // Leave out the required microLessonId before the request reaches quiz logic.
    const response = await request(app).post("/api/v1/quizzes/start").set(authHeader()).send({});

    expectValidationError(response);
    expect(response.body.errors.join(" ")).toContain("required");
  });

  test("rejects quiz starts with a missing request body", async () => {
    const response = await request(app).post("/api/v1/quizzes/start").set(authHeader());

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

  test("rejects malformed forgot-password email addresses", async () => {
    // Send an invalid email format so the request fails before password reset processing starts.
    const response = await request(app)
      .post("/api/v1/users/forgot-password")
      .send({ email: "not-an-email" });

    expectValidationError(response);
    expect(response.body.errors.join(" ")).toContain("valid email address");
  });

  test("rejects invalid reset tokens and weak passwords", async () => {
    // Make both reset values invalid so validation can report more than one problem.
    const response = await request(app)
      .post("/api/v1/users/reset-password")
      .send({ token: "invalid", newPassword: "weak" });

    expectValidationError(response);
    expect(response.body.errors.length).toBeGreaterThan(1);
  });

  test("rejects unsupported dashboard event types", async () => {
    // Send an event type that is not part of the supported dashboard event list.
    const response = await request(app)
      .post("/api/v1/dashboard/events")
      .set(authHeader())
      .send({ type: "cache_bypass" });

    expectValidationError(response);
  });

  test("accepts valid lesson progress and quiz submission payloads", () => {
    expect(lessonProgressSchema.validate({ lessonId: "1.1" }).error).toBeUndefined();
    expect(
      quizSubmissionSchema.validate({
        attemptId: new mongoose.Types.ObjectId().toString(),
        answers: { "question-1": "answer-1" },
      }).error,
    ).toBeUndefined();
  });
});
