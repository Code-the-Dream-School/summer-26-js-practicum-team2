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
});
