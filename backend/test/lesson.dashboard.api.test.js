const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");
const app = require("../src/app");
const User = require("../src/models/User.model");

useTestDb();

async function createAuthedUser({
  name = "Progress User",
  email = "progress-user@example.com",
} = {}) {
  const user = await User.create({
    name,
    email,
    password_hash: "not-a-real-hash",
    role: "learner",
    tos_agreement: true,
    email_verified_at: new Date(),
  });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

  return {
    user,
    authHeader: `Bearer ${token}`,
  };
}

describe("lesson and dashboard API integration", () => {
  it("returns progress data and updates the active lesson cursor", async () => {
    const { authHeader } = await createAuthedUser({
      name: "Lesson Reader",
      email: "lesson-progress@example.com",
    });

    const progressRes = await request(app)
      .get("/api/v1/lessons/progress")
      .set("Authorization", authHeader)
      .query({ moduleId: "cashFlow" });

    expect(progressRes.status).toBe(200);
    expect(progressRes.body.currentModule).toBe("cashFlow");
    expect(progressRes.body.currentLessonId).toBe("1.1");
    expect(progressRes.body.currentMicroLessonId).toBe("1.1.1");

    const updateRes = await request(app)
      .patch("/api/v1/lessons/progress")
      .set("Authorization", authHeader)
      .send({ moduleId: "cashFlow", lessonId: "1.1", microLessonId: "1.1.2" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.currentLessonId).toBe("1.1");
    expect(updateRes.body.currentMicroLessonId).toBe("1.1.2");

    const lessonRes = await request(app)
      .get("/api/v1/lessons/cashFlow/1.1")
      .set("Authorization", authHeader);

    expect(lessonRes.status).toBe(200);
    expect(lessonRes.body.moduleData.id).toBe("cashFlow");
    expect(lessonRes.body.lessonData.id).toBe("1.1");
    expect(lessonRes.body.progress.currentMicroLessonId).toBe("1.1.2");
  });

  it("builds a dashboard payload for a new learner and exposes the next action", async () => {
    const { authHeader } = await createAuthedUser({
      name: "Dashboard Learner",
      email: "dashboard-example@example.com",
    });

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
});
