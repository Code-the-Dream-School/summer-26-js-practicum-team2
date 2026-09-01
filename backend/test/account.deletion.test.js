const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");

const app = require("../src/app");
const User = require("../src/models/User.model");
const { hashPassword } = require("../src/utils/password");

useTestDb();

async function createUser({ email, role = "learner", tokenVersion = 0, ...overrides }) {
  return User.create({
    name: "Account Test User",
    email,
    password_hash: "not-a-real-hash",
    role,
    token_version: tokenVersion,
    tos_agreement: true,
    ...overrides,
  });
}

function authHeader(user) {
  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      csrfToken: "test-csrf",
      token_version: user.token_version,
    },
    process.env.JWT_SECRET,
  );

  return `Bearer ${token}`;
}

describe("account deletion workflow", () => {
  it("serves a profile and prevents duplicate deletion requests", async () => {
    const user = await createUser({ email: "profile-delete@example.com" });
    const authorization = authHeader(user);

    const profileResponse = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", authorization);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.user.email).toBe(user.email);

    const firstRequest = await request(app)
      .post("/api/v1/profile/request-deletion")
      .set("Authorization", authorization)
      .send({ email: user.email });

    expect(firstRequest.status).toBe(200);

    const duplicateRequest = await request(app)
      .post("/api/v1/profile/request-deletion")
      .set("Authorization", authorization)
      .send({ email: user.email });

    expect(duplicateRequest.status).toBe(409);
  });

  it("redacts admin users and only approves pending deletion requests", async () => {
    const admin = await createUser({ email: "admin@example.com", role: "admin" });
    const learner = await createUser({ email: "learner@example.com" });
    const adminAuthorization = authHeader(admin);
    const learnerAuthorization = authHeader(learner);

    const usersResponse = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", adminAuthorization);

    expect(usersResponse.status).toBe(200);
    expect(usersResponse.body.users[0]).toEqual(
      expect.objectContaining({
        _id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: "admin",
      }),
    );
    expect(usersResponse.body.users[0]).not.toHaveProperty("password_hash");

    const unrequestedApproval = await request(app)
      .patch(`/api/v1/admin/deletions/approve/${learner._id}`)
      .set("Authorization", adminAuthorization);

    expect(unrequestedApproval.status).toBe(409);

    await User.updateOne(
      { _id: learner._id },
      { $set: { deletion_status: "pending", deletion_requested_at: new Date() } },
    );

    const approvedResponse = await request(app)
      .patch(`/api/v1/admin/deletions/approve/${learner._id}`)
      .set("Authorization", adminAuthorization);

    expect(approvedResponse.status).toBe(200);
    expect(approvedResponse.body).not.toHaveProperty("user");

    const deletedLearner = await User.findOne({
      _id: learner._id,
      is_deleted: true,
      is_archived: false,
    });
    expect(deletedLearner.deletion_status).toBe("approved");
    expect(deletedLearner.token_version).toBe(1);

    const staleSessionResponse = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", learnerAuthorization);

    expect(staleSessionResponse.status).toBe(401);

    const repeatedApproval = await request(app)
      .patch(`/api/v1/admin/deletions/approve/${learner._id}`)
      .set("Authorization", adminAuthorization);

    expect(repeatedApproval.status).toBe(409);
  });

  it("reactivates a recently approved account", async () => {
    const admin = await createUser({ email: "reactivate-admin@example.com", role: "admin" });
    const deletedUser = await createUser({
      email: "reactivate-user@example.com",
      deletion_status: "approved",
      is_deleted: true,
      deleted_at: new Date(),
    });

    const response = await request(app)
      .patch(`/api/v1/admin/deletions/reactivate/${deletedUser._id}`)
      .set("Authorization", authHeader(admin));

    expect(response.status).toBe(200);

    const reactivatedUser = await User.findById(deletedUser._id);
    expect(reactivatedUser.is_deleted).toBe(false);
    expect(reactivatedUser.deletion_status).toBe("none");
  });

  it("allows a user to reactivate a recently approved account", async () => {
    const password = "correct-password";
    const deletedUser = await createUser({
      email: "self-reactivate@example.com",
      password_hash: await hashPassword(password),
      deletion_status: "approved",
      is_deleted: true,
      deleted_at: new Date(),
    });

    const response = await request(app).post("/api/v1/users/reactivate").send({
      email: deletedUser.email,
      password,
    });

    expect(response.status).toBe(200);

    const reactivatedUser = await User.findById(deletedUser._id);
    expect(reactivatedUser.is_deleted).toBe(false);
    expect(reactivatedUser.deletion_status).toBe("none");
  });

  it("only rejects pending deletion requests", async () => {
    const admin = await createUser({ email: "reject-admin@example.com", role: "admin" });
    const learner = await createUser({
      email: "reject-learner@example.com",
      deletion_status: "pending",
      deletion_requested_at: new Date(),
    });
    const authorization = authHeader(admin);

    const rejectedResponse = await request(app)
      .patch(`/api/v1/admin/deletions/deny/${learner._id}`)
      .set("Authorization", authorization);

    expect(rejectedResponse.status).toBe(200);
    expect(rejectedResponse.body).not.toHaveProperty("user");

    const rejectedUser = await User.findById(learner._id);
    expect(rejectedUser.deletion_status).toBe("denied");
    expect(rejectedUser.deletion_requested_at).toBeNull();

    const repeatedRejection = await request(app)
      .patch(`/api/v1/admin/deletions/deny/${learner._id}`)
      .set("Authorization", authorization);

    expect(repeatedRejection.status).toBe(409);
  });

  it("rejects a session token when its version is obsolete", async () => {
    const user = await createUser({ email: "token-version@example.com" });
    const authorization = authHeader(user);

    await User.updateOne({ _id: user._id }, { $set: { token_version: 1 } });

    const response = await request(app).get("/api/v1/profile").set("Authorization", authorization);

    expect(response.status).toBe(401);
  });
});
