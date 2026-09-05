const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");

const app = require("../src/app");
const User = require("../src/models/User.model");
const UserProgress = require("../src/models/UserProgress.model");

useTestDb();

// Create a learner and return the authentication values needed for progress requests.
async function createAuthedUser(email) {
  const user = await User.create({
    name: "Progress Learner",
    email,
    password_hash: "not-a-real-hash",
    tos_agreement: true,
  });

  // Create a valid token so these tests can focus on lesson progress behavior.
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

  return { authHeader: `Bearer ${token}`, userId: user._id };
}

describe("lesson progress regression coverage (backend)", () => {
  it("creates and returns default progress when none exists", async () => {
    const { authHeader, userId } = await createAuthedUser("defaults-progress@example.com");

    // Request progress before the learner has an existing progress record.
    const response = await request(app)
      .get("/api/v1/lessons/progress?moduleId=cashFlow")
      .set("Authorization", authHeader);

    // New progress should start at the beginning of the module.
    expect(response.status).toBe(200);
    expect(response.body.currentModule).toBe("cashFlow");
    expect(response.body.currentLessonId).toBe("1.1");
    expect(response.body.currentMicroLessonId).toBe("1.1.1");
    expect(response.body.currentChunkIndex).toBe(0);

    // The default progress should also be saved instead of only being returned by the API.
    const records = await UserProgress.find({ user_id: userId, module_id: "cashFlow" });
    expect(records).toHaveLength(1);
  });

  it("persists lesson, micro-lesson, and chunk index updates", async () => {
    const { authHeader, userId } = await createAuthedUser("update-progress@example.com");

    // Move the learner to a specific position inside the lesson.
    const response = await request(app)
      .patch("/api/v1/lessons/progress")
      .set("Authorization", authHeader)
      .send({
        moduleId: "cashFlow",
        lessonId: "1.1",
        microLessonId: "1.1.2",
        currentChunkIndex: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.currentLessonId).toBe("1.1");
    expect(response.body.currentMicroLessonId).toBe("1.1.2");
    expect(response.body.currentChunkIndex).toBe(2);

    // Check the database too so the updated position was actually persisted.
    const progressRecord = await UserProgress.findOne({
      user_id: userId,
      module_id: "cashFlow",
    }).lean();

    expect(progressRecord.course_lesson_id).toBe("1.1");
    expect(progressRecord.current_micro_lesson_id).toBe("1.1.2");
    expect(progressRecord.current_chunk_index).toBe(2);
  });

  it("restarts to the first lesson position while preserving completion history", async () => {
    const { authHeader, userId } = await createAuthedUser("restart-preserve@example.com");

    // Start the learner partway through the module with previous lesson progress already completed.
    await UserProgress.create({
      user_id: userId,
      module_id: "cashFlow",
      course_lesson_id: "1.2",
      current_micro_lesson_id: "1.2.3",
      current_chunk_index: 3,
      completed_lessons: ["1.1"],
      completed_micro_lessons: ["1.1.1", "1.1.2", "1.1.3", "1.1.4"],
      is_module_completed: false,
    });

    // Restart progress and make sure the learner is moved back to the beginning.
    const response = await request(app)
      .patch("/api/v1/lessons/progress/restart")
      .set("Authorization", authHeader)
      .send({ moduleId: "cashFlow" });

    expect(response.status).toBe(200);
    expect(response.body.currentLessonId).toBe("1.1");
    expect(response.body.currentMicroLessonId).toBe("1.1.1");
    expect(response.body.currentChunkIndex).toBe(0);

    // Restarting should change the current position without removing completion history.
    expect(response.body.completedLessons).toEqual(["1.1"]);
    expect(response.body.completedMicroLessons).toEqual(["1.1.1", "1.1.2", "1.1.3", "1.1.4"]);
  });

  it("is idempotent for existing progress and does not create duplicate records", async () => {
    const { authHeader, userId } = await createAuthedUser("restart-idempotent@example.com");

    // Give the learner an existing progress record before restarting it more than once.
    await UserProgress.create({
      user_id: userId,
      module_id: "cashFlow",
      course_lesson_id: "1.1",
      current_micro_lesson_id: "1.1.2",
      current_chunk_index: 1,
    });

    // Restart the same progress twice to make sure repeating the request is safe.
    const first = await request(app)
      .patch("/api/v1/lessons/progress/restart")
      .set("Authorization", authHeader)
      .send({ moduleId: "cashFlow" });

    const second = await request(app)
      .patch("/api/v1/lessons/progress/restart")
      .set("Authorization", authHeader)
      .send({ moduleId: "cashFlow" });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.currentLessonId).toBe("1.1");
    expect(second.body.currentMicroLessonId).toBe("1.1.1");
    expect(second.body.currentChunkIndex).toBe(0);

    // Repeating the restart should update the same record instead of creating another one.
    const records = await UserProgress.find({ user_id: userId, module_id: "cashFlow" });
    expect(records).toHaveLength(1);
  });
});

describe("micro-lesson completion rewards", () => {
  it("rejects completion before passing a knowledge check", async () => {
    const { authHeader, userId } = await createAuthedUser("completion-check@example.com");
    const response = await request(app)
      .post("/api/v1/lessons/complete")
      .set("Authorization", authHeader)
      .send({ moduleId: "cashFlow", microLessonId: "1.1.2" });
    expect(response.status).toBe(409);
    expect(await UserProgress.countDocuments({ user_id: userId })).toBe(0);
  });
  it("awards a streak and badge only on the first reading completion", async () => {
    const LessonModule = require("../src/models/LessonModule.model");
    await LessonModule.create({
      id: "reading",
      title: "Reading",
      lessons: [{ id: "reading.1", microLessons: [{ id: "reading.1.1", microLessonContent: [] }] }],
    });
    const { authHeader } = await createAuthedUser("completion-rewards@example.com");
    const complete = () =>
      request(app)
        .post("/api/v1/lessons/complete")
        .set("Authorization", authHeader)
        .send({ moduleId: "reading", microLessonId: "reading.1.1" });
    const first = await complete();
    expect(first.status).toBe(200);
    expect(first.body.rewards.streak.streakAwarded).toBe(true);
    expect(first.body.rewards.badges).toHaveLength(1);
    const second = await complete();
    expect(second.status).toBe(200);
    expect(second.body.rewards.streak).toBeNull();
    expect(second.body.rewards.badges).toEqual([]);
  });
});
