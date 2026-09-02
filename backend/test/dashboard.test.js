const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");

const app = require("../src/app");
const LessonModule = require("../src/models/LessonModule.model");
const User = require("../src/models/User.model");
const UserProgress = require("../src/models/UserProgress.model");

useTestDb();

async function createAuthedUser(email) {
  const user = await User.create({
    name: "Dashboard Learner",
    email,
    password_hash: "not-a-real-hash",
    tos_agreement: true,
  });
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

  return { authHeader: `Bearer ${token}`, userId: user._id };
}

async function seedDashboardModule() {
  await LessonModule.create({
    id: "budgeting",
    title: "Budgeting Basics",
    lessons: [
      {
        id: "1.1",
        title: "Start a budget",
        microLessons: [{ id: "1.1.1", title: "Income", microLessonContent: [] }],
      },
      {
        id: "1.2",
        title: "Plan your spending",
        microLessons: [{ id: "1.2.1", title: "Expenses", microLessonContent: [] }],
      },
    ],
  });
}

describe("dashboard endpoint", () => {
  it("returns overall and per-unit progress for a learner", async () => {
    const { authHeader, userId } = await createAuthedUser("dashboard-progress@example.com");
    await seedDashboardModule();
    await UserProgress.create({
      user_id: userId,
      module_id: "budgeting",
      completed_lessons: ["1.1"],
      completed_micro_lessons: ["1.1.1"],
    });

    const response = await request(app).get("/api/v1/dashboard").set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body.progress).toEqual({
      completedLessons: 1,
      totalLessons: 2,
      overallPercent: 50,
    });
    expect(response.body.units).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "budgeting",
          completedLessons: 1,
          totalLessons: 2,
          progressPercent: 50,
        }),
      ]),
    );
  });

  it("invalidates a cached dashboard after lesson completion", async () => {
    const { authHeader } = await createAuthedUser("dashboard-completion@example.com");
    await seedDashboardModule();

    const initialResponse = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", authHeader);
    expect(initialResponse.body.progress.overallPercent).toBe(0);

    const completionResponse = await request(app)
      .post("/api/v1/lessons/progress/complete")
      .set("Authorization", authHeader)
      .send({ moduleId: "budgeting", lessonId: "1.1" });
    expect(completionResponse.status).toBe(200);
    expect(completionResponse.body.completedLessons).toEqual(["1.1"]);

    const refreshedResponse = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", authHeader);
    expect(refreshedResponse.body.progress.overallPercent).toBe(50);
    expect(refreshedResponse.body.nextAction.href).toBe("/learn/budgeting/1.2");
  });
});
