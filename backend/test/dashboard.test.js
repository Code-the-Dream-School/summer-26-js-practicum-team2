const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");

const app = require("../src/app");
const LessonModule = require("../src/models/LessonModule.model");
const QuizAttempt = require("../src/models/QuizAttempt.model");
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
    expect(initialResponse.body.hero.state).toBe("new_user");

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
    expect(refreshedResponse.body.hero.state).toBe("in_progress");
    expect(refreshedResponse.body.nextAction.href).toBe("/learn/budgeting/1.2");

    const finalCompletionResponse = await request(app)
      .post("/api/v1/lessons/progress/complete")
      .set("Authorization", authHeader)
      .send({ moduleId: "budgeting", lessonId: "1.2" });
    expect(finalCompletionResponse.status).toBe(200);

    const caughtUpResponse = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", authHeader);
    expect(caughtUpResponse.body.hero.state).toBe("all_caught_up");
    expect(caughtUpResponse.body.nextAction.title).toBe("Review Quiz");
  });

  it("derives the streak and daily goal from successful learning checks", async () => {
    const { authHeader, userId } = await createAuthedUser("dashboard-motivation@example.com");
    await seedDashboardModule();
    const now = new Date();
    await QuizAttempt.create({
      user_id: userId,
      module_id: "budgeting",
      lesson_id: "1.1",
      micro_lesson_id: "1.1.1",
      attempt_number: 1,
      started_at: now,
      submitted_at: now,
      score: 100,
      passed: true,
    });

    const response = await request(app).get("/api/v1/dashboard").set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body.hero.streak.currentDays).toBe(1);
    expect(response.body.hero.dailyGoal).toEqual({
      type: "learning_checks",
      current: 1,
      target: 1,
      isMet: true,
      label: "1 / 1 learning check",
    });
  });

  it("uses the same quiz-attempt streak for profile and dashboard", async () => {
    const { authHeader, userId } = await createAuthedUser("dashboard-profile-streak@example.com");
    await seedDashboardModule();
    const now = new Date();
    await QuizAttempt.create({
      user_id: userId,
      module_id: "budgeting",
      lesson_id: "1.1",
      micro_lesson_id: "1.1.1",
      attempt_number: 1,
      started_at: now,
      submitted_at: now,
      score: 100,
      passed: true,
    });
    await User.updateOne({ _id: userId }, { $set: { streak: 99 } });

    const [dashboardResponse, profileResponse] = await Promise.all([
      request(app).get("/api/v1/dashboard").set("Authorization", authHeader),
      request(app).get("/api/v1/profile").set("Authorization", authHeader),
    ]);

    expect(dashboardResponse.body.hero.streak.currentDays).toBe(1);
    expect(profileResponse.body.user.streak).toBe(1);
  });
});
