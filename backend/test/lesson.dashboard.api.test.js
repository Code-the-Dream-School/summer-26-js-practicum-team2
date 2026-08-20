const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");
const app = require("../src/app");
const User = require("../src/models/User.model");
const QuizAttempt = require("../src/models/QuizAttempt.model");
const UserProgress = require("../src/models/UserProgress.model");

useTestDb();

// Creates a basic verified learner and gives us a token
// so each test does not have to repeat all of this setup.
async function createAuthedUser(
  name = "Progress User",
  email = "progress-user@example.com",
) {
  const user = await User.create({
    name,
    email,
    password_hash: "not-a-real-hash",
    role: "learner",
    tos_agreement: true,
    email_verified_at: new Date(),
  });

  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      csrfToken: "test-csrf",
    },
    process.env.JWT_SECRET,
  );

  return {
    user,
    authHeader: `Bearer ${token}`,
  };
}

describe("lesson and dashboard API integration", () => {
  it("returns progress data and updates the active lesson cursor", async () => {
    const { authHeader } = await createAuthedUser(
      "Lesson Reader",
      "lesson-progress@example.com",
    );

    // A new user should start at the beginning of the module.
    const progressRes = await request(app)
      .get("/api/v1/lessons/progress")
      .set("Authorization", authHeader)
      .query({ moduleId: "cashFlow" });

    expect(progressRes.status).toBe(200);
    expect(progressRes.body).toMatchObject({
      currentModule: "cashFlow",
      currentLessonId: "1.1",
      currentMicroLessonId: "1.1.1",
    });

    // Move the user's saved position to the next micro-lesson.
    const updateRes = await request(app)
      .patch("/api/v1/lessons/progress")
      .set("Authorization", authHeader)
      .send({
        moduleId: "cashFlow",
        lessonId: "1.1",
        microLessonId: "1.1.2",
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toMatchObject({
      currentLessonId: "1.1",
      currentMicroLessonId: "1.1.2",
    });

    // Fetching the lesson should use the progress we just saved.
    const lessonRes = await request(app)
      .get("/api/v1/lessons/cashFlow/1.1")
      .set("Authorization", authHeader);

    expect(lessonRes.status).toBe(200);
    expect(lessonRes.body.moduleData.id).toBe("cashFlow");
    expect(lessonRes.body.lessonData.id).toBe("1.1");
    expect(lessonRes.body.progress.currentMicroLessonId).toBe("1.1.2");
  });

  it("builds a dashboard payload for a new learner and exposes the next action", async () => {
    const { authHeader } = await createAuthedUser(
      "Dashboard Learner",
      "dashboard-example@example.com",
    );

    const dashboardRes = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", authHeader);

    expect(dashboardRes.status).toBe(200);

    expect(dashboardRes.body.hero).toMatchObject({
      displayName: "Dashboard Learner",
      state: "new_user",
    });

    expect(dashboardRes.body.nextAction).toMatchObject({
      href: expect.stringContaining("/learn/cashFlow/1.1"),
      ctaLabel: expect.stringContaining("Start"),
    });

    // Make sure the dashboard includes the module without caring
    // about every other field returned with it.
    expect(dashboardRes.body.units).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "cashFlow",
          totalLessons: expect.any(Number),
        }),
      ]),
    );

    expect(dashboardRes.body.recentActivity).toEqual([]);
  });

  it("resolves passed quiz attempts into dashboard progress data", async () => {
    const { user, authHeader } = await createAuthedUser(
      "Progress Resolver",
      "progress-resolver@example.com",
    );

    // Add a passed quiz attempt without manually updating UserProgress.
    // The dashboard request should resolve the two for us.
    await QuizAttempt.create({
      user_id: user._id,
      module_id: "cashFlow",
      lesson_id: "1.1",
      micro_lesson_id: "1.1.2",
      attempt_number: 1,
      started_at: new Date(),
      submitted_at: new Date(),
      score: 100,
      passed: true,
      answers: [],
    });

    const dashboardRes = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", authHeader);

    expect(dashboardRes.status).toBe(200);

    // Check the database too, since this endpoint is expected
    // to repair the saved progress when it finds a passed attempt.
    const progress = await UserProgress.findOne({
      user_id: user._id,
      module_id: "cashFlow",
    });

    expect(progress.completed_micro_lessons).toContain("1.1.2");

    expect(dashboardRes.body.recentActivity[0].label).toContain(
      "Passed quiz: What is a Budget?",
    );
    expect(dashboardRes.body.recentActivity[0].label).toContain("(100%)");
  });
});