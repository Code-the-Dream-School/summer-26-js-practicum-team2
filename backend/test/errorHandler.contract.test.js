const errorHandlerMiddleware = require("../src/middleware/errorHandler");

// Create just enough of an Express response object for the error handler tests.
function createMockRes() {
  const res = {
    headersSent: false,
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
}

describe("error handler contracts", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Hide the expected console errors so they do not clutter the test output.
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test so it behaves normally again.
    consoleErrorSpy.mockRestore();
  });

  it("maps mongoose validation errors to 400 with message list", () => {
    // Build a simple mock of the validation error shape Mongoose normally returns.
    const err = {
      name: "ValidationError",
      errors: {
        email: { message: "Email is required." },
        password: { message: "Password is too short." },
      },
      constructor: { name: "ValidationError" },
    };

    const res = createMockRes();

    // Pass the mock error directly through the error handling middleware.
    errorHandlerMiddleware(err, {}, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Validation error",
      errors: ["Email is required.", "Password is too short."],
    });
  });

  it("maps mongoose cast errors to 400 with a field-specific message", () => {
    // Mock a CastError for an invalid value passed to the user_id field.
    const err = {
      name: "CastError",
      path: "user_id",
      constructor: { name: "CastError" },
    };

    const res = createMockRes();
    errorHandlerMiddleware(err, {}, res, () => {});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Invalid value for user_id.",
      field: "user_id",
    });
  });

  it("maps duplicate-key errors to 409 with the duplicate field name", () => {
    // MongoDB uses error code 11000 when a unique field already exists.
    const err = {
      code: 11000,
      keyValue: { email: "duplicate@example.com" },
      constructor: { name: "MongoServerError" },
    };

    const res = createMockRes();
    errorHandlerMiddleware(err, {}, res, () => {});

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      message: "email already exists.",
    });
  });

  it("maps unknown errors to a stable 500 payload", () => {
    // Use an error the middleware does not specifically handle to test the fallback response.
    const err = {
      name: "SomeUnhandledError",
      constructor: { name: "SomeUnhandledError" },
    };

    const res = createMockRes();
    errorHandlerMiddleware(err, {}, res, () => {});

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      message: "An internal server error occurred.",
    });
  });
});