const jwt = require("jsonwebtoken");
const User = require("../../src/models/User.model");

// Creates a verified learner and returns the authentication values
// commonly needed by integration tests.
async function createAuthedUser(name = "Test Learner", email = "test-learner@example.com") {
  const user = await User.create({
    name,
    email,
    password_hash: "not-a-real-hash",
    role: "learner",
    tos_agreement: true,
    email_verified_at: new Date(),
  });

  // Create a valid JWT so tests can make authenticated requests
  // without going through the full login flow each time.
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

  return {
    user,
    token,
    authHeader: `Bearer ${token}`,
  };
}

module.exports = {
  createAuthedUser,
};
