import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import {
  createAdminLesson,
  createAdminModule,
  deleteAdminLesson,
  deleteAdminModule,
  getAdminModules,
  getAdminUsers,
  hardDeleteAdminUser,
  importAdminLessonModule,
  resetAdminUserProgress,
  seedAdminBudgetingModule,
  setAdminUserDisabled,
  setAdminUserDeleted,
  updateAdminModule,
  updateAdminLesson,
  updateAdminUserRole,
  verifyAdminUserEmail,
} from "../services/api";
import Card from "../shared/Card/Card.component";
import Button from "../shared/Button/Button.component";

const emptyModule = { id: "", title: "", lessons: [] };

export default function AdminDashboardPage() {
  const { csrfToken, user: currentUser } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [moduleForm, setModuleForm] = useState(emptyModule);
  const [lessonTitle, setLessonTitle] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [lessonJson, setLessonJson] = useState("");
  const [state, setState] = useState({ isLoading: true, error: "", message: "" });

  const loadData = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: "" }));
    try {
      const [userPayload, modulePayload] = await Promise.all([getAdminUsers(), getAdminModules()]);
      setUsers(userPayload.users ?? []);
      setModules(modulePayload.modules ?? []);
      setSelectedModuleId((current) => current || modulePayload.modules?.[0]?.id || "");
      setState((current) => ({ ...current, isLoading: false }));
    } catch (error) {
      setState({ isLoading: false, error: error.message, message: "" });
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedModule = modules.find((module) => module.id === selectedModuleId);

  async function runAction(action, successMessage) {
    try {
      await action();
      setState({ isLoading: false, error: "", message: successMessage });
      await loadData();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  }

  function handleModuleSelect(module) {
    setSelectedModuleId(module.id);
    setModuleForm({ id: module.id, title: module.title, lessons: module.lessons ?? [] });
    setSelectedLessonId(module.lessons?.[0]?.id || "");
    setLessonJson(module.lessons?.[0] ? JSON.stringify(module.lessons[0], null, 2) : "");
  }

  function handleLessonSelect(lesson) {
    setSelectedLessonId(lesson.id);
    setLessonJson(JSON.stringify(lesson, null, 2));
  }

  function parseLessonJson() {
    try {
      return JSON.parse(lessonJson);
    } catch {
      throw new Error("Lesson JSON is invalid. Check commas, quotes, and brackets.");
    }
  }

  function getLessonDraft() {
    try {
      return JSON.parse(lessonJson);
    } catch {
      return null;
    }
  }

  function updateLessonDraft(updater) {
    try {
      const draft = updater(parseLessonJson());
      setLessonJson(JSON.stringify(draft, null, 2));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  }

  function updateLessonField(field, value) {
    updateLessonDraft((lesson) => ({ ...lesson, [field]: value }));
  }

  function updateMicroLesson(microLessonId, field, value) {
    updateLessonDraft((lesson) => ({
      ...lesson,
      microLessons: (lesson.microLessons ?? []).map((microLesson) =>
        microLesson.id === microLessonId ? { ...microLesson, [field]: value } : microLesson,
      ),
    }));
  }

  function updateBlock(microLessonId, blockIndex, value) {
    updateLessonDraft((lesson) => ({
      ...lesson,
      microLessons: (lesson.microLessons ?? []).map((microLesson) => {
        if (microLesson.id !== microLessonId) return microLesson;
        const content = [...(microLesson.microLessonContent ?? [])];
        content[blockIndex] = { ...content[blockIndex], text: value };
        return { ...microLesson, microLessonContent: content };
      }),
    }));
  }

  function addMicroLesson() {
    updateLessonDraft((lesson) => ({
      ...lesson,
      microLessons: [
        ...(lesson.microLessons ?? []),
        {
          id: `${lesson.id}-micro-${Date.now()}`,
          title: "New micro-lesson",
          microLessonContent: [{ type: "paragraph", text: "Write lesson content here." }],
        },
      ],
    }));
  }

  function removeMicroLesson(microLessonId) {
    updateLessonDraft((lesson) => ({
      ...lesson,
      microLessons: (lesson.microLessons ?? []).filter(
        (microLesson) => microLesson.id !== microLessonId,
      ),
    }));
  }

  const lessonDraft = getLessonDraft();

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-small font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="font-heading text-h1 font-bold text-heading">Control center</h1>
        <p className="max-w-2xl text-foreground">Manage users and lesson content.</p>
      </header>

      {state.error ? (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-success">
          {state.message}
        </p>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <h2 className="font-heading text-h3 font-bold text-heading">Users</h2>
          <span className="text-sm text-foreground">{users.length} loaded</span>
        </div>
        {state.isLoading ? <p className="p-5 text-foreground">Loading...</p> : null}
        {!state.isLoading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-primary/5 text-heading">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((adminUser) => (
                  <tr key={adminUser.id} className="border-t border-primary/10">
                    <td className="px-5 py-4 font-medium text-heading">{adminUser.name}</td>
                    <td className="px-5 py-4 text-foreground">{adminUser.email}</td>
                    <td className="px-5 py-4 capitalize text-foreground">{adminUser.role}</td>
                    <td className="px-5 py-4 text-foreground">
                      {adminUser.deleted_at
                        ? `Deletion scheduled${adminUser.deletion_scheduled_at ? ` (${new Date(adminUser.deletion_scheduled_at).toLocaleDateString()})` : ""}`
                        : adminUser.is_disabled
                          ? "Banned"
                          : "Active"}
                    </td>
                    <td className="flex flex-wrap gap-2 px-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-8 px-2 py-1 text-xs underline"
                        disabled={adminUser.id === currentUser?.id}
                        onClick={() =>
                          void runAction(
                            () => resetAdminUserProgress({ userId: adminUser.id, csrfToken }),
                            "Progress reset.",
                          )
                        }
                      >
                        Reset progress
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-8 px-2 py-1 text-xs underline"
                        disabled={adminUser.id === currentUser?.id}
                        onClick={() =>
                          void runAction(
                            () =>
                              setAdminUserDisabled({
                                userId: adminUser.id,
                                disabled: !adminUser.is_disabled,
                                csrfToken,
                              }),
                            "User status updated.",
                          )
                        }
                      >
                        {adminUser.is_disabled ? "Unban" : "Ban"}
                      </Button>
                      {!adminUser.email_verified_at ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-8 px-2 py-1 text-xs underline"
                          disabled={adminUser.id === currentUser?.id}
                          onClick={() =>
                            void runAction(
                              () => verifyAdminUserEmail({ userId: adminUser.id, csrfToken }),
                              "Email verified.",
                            )
                          }
                        >
                          Verify email
                        </Button>
                      ) : null}
                      {adminUser.id !== currentUser?.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-8 px-2 py-1 text-xs underline"
                          onClick={() =>
                            void runAction(
                              () =>
                                updateAdminUserRole({
                                  userId: adminUser.id,
                                  role: adminUser.role === "admin" ? "learner" : "admin",
                                  csrfToken,
                                }),
                              "User role updated.",
                            )
                          }
                        >
                          {adminUser.role === "admin" ? "Demote" : "Promote"}
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-8 px-2 py-1 text-xs underline"
                        disabled={adminUser.id === currentUser?.id}
                        onClick={() =>
                          void runAction(
                            () =>
                              setAdminUserDeleted({
                                userId: adminUser.id,
                                deleted: !adminUser.deleted_at,
                                csrfToken,
                              }),
                            adminUser.deleted_at ? "User restored." : "User deleted.",
                          )
                        }
                      >
                        {adminUser.deleted_at ? "Restore" : "Delete"}
                      </Button>
                      {adminUser.deleted_at ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-8 px-2 py-1 text-xs text-danger underline"
                          disabled={adminUser.id === currentUser?.id}
                          onClick={() => {
                            if (window.confirm(`Permanently delete ${adminUser.email}?`)) {
                              void runAction(
                                () =>
                                  hardDeleteAdminUser({
                                    userId: adminUser.id,
                                    email: adminUser.email,
                                    csrfToken,
                                  }),
                                "User permanently deleted.",
                              );
                            }
                          }}
                        >
                          Hard delete
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-h3 font-bold text-heading">Lesson modules</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() =>
                void runAction(
                  () => seedAdminBudgetingModule(csrfToken),
                  "Budgeting module seeded.",
                )
              }
            >
              Seed budgeting
            </Button>
            <label className="cursor-pointer rounded-md border border-primary px-4 py-2 font-semibold text-primary">
              Upload JSON
              <input
                className="sr-only"
                type="file"
                accept=".json,application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file)
                    void runAction(
                      () => importAdminLessonModule({ file, csrfToken }),
                      "Lesson module imported.",
                    );
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <div className="space-y-2">
            {modules.map((module) => (
              <Button
                variant={module.id === selectedModuleId ? "primary" : "secondary"}
                key={module.id}
                className="w-full justify-start text-left"
                onClick={() => handleModuleSelect(module)}
              >
                {module.title}{" "}
                <span className="text-sm text-foreground">({module.lessonCount})</span>
              </Button>
            ))}
            <Button
              variant="secondary"
              className="w-full border-dashed text-primary"
              onClick={() => {
                setSelectedModuleId("");
                setModuleForm(emptyModule);
              }}
            >
              New module
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border border-primary/20 px-3 py-2"
                placeholder="Module ID"
                value={moduleForm.id}
                disabled={Boolean(selectedModule)}
                onChange={(event) => setModuleForm({ ...moduleForm, id: event.target.value })}
              />
              <input
                className="rounded-md border border-primary/20 px-3 py-2"
                placeholder="Module title"
                value={moduleForm.title}
                onChange={(event) => setModuleForm({ ...moduleForm, title: event.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() =>
                  void runAction(
                    () =>
                      selectedModule
                        ? updateAdminModule({
                            moduleId: selectedModule.id,
                            updates: { title: moduleForm.title },
                            csrfToken,
                          })
                        : createAdminModule({ module: moduleForm, csrfToken }),
                    selectedModule ? "Module updated." : "Module created.",
                  )
                }
              >
                {selectedModule ? "Save module" : "Create module"}
              </Button>
              {selectedModule ? (
                <Button
                  variant="ghost"
                  className="border border-danger text-danger"
                  onClick={() => {
                    if (window.confirm("Delete this module?"))
                      void runAction(
                        () => deleteAdminModule({ moduleId: selectedModule.id, csrfToken }),
                        "Module deleted.",
                      );
                  }}
                >
                  Delete module
                </Button>
              ) : null}
            </div>
            {selectedModule ? (
              <div className="space-y-3 border-t border-primary/10 pt-4">
                <h3 className="font-heading text-xl font-bold text-heading">Lessons</h3>
                <div className="flex gap-3">
                  <input
                    className="rounded-md border border-primary/20 px-3 py-2"
                    placeholder="New lesson title"
                    value={lessonTitle}
                    onChange={(event) => setLessonTitle(event.target.value)}
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      const id = `${selectedModule.id}-lesson-${Date.now()}`;
                      void runAction(
                        () =>
                          createAdminLesson({
                            moduleId: selectedModule.id,
                            lesson: { id, title: lessonTitle, microLessons: [] },
                            csrfToken,
                          }),
                        "Lesson created.",
                      );
                      setLessonTitle("");
                    }}
                  >
                    Add lesson
                  </Button>
                </div>
                {(selectedModule.lessons ?? []).map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between border-b border-primary/10 py-2 ${lesson.id === selectedLessonId ? "font-semibold text-primary" : ""}`}
                  >
                    <Button
                      variant="ghost"
                      className="justify-start px-2"
                      onClick={() => handleLessonSelect(lesson)}
                    >
                      {lesson.title || lesson.id}
                    </Button>
                    <div className="flex gap-2">
                      <span className="text-xs text-foreground">
                        {lesson.microLessons?.length ?? 0} micro-lessons
                      </span>
                      <Button
                        variant="ghost"
                        className="min-h-8 px-2 py-1 text-xs text-danger underline"
                        onClick={() => {
                          if (window.confirm("Delete this lesson?"))
                            void runAction(
                              () =>
                                deleteAdminLesson({
                                  moduleId: selectedModule.id,
                                  lessonId: lesson.id,
                                  csrfToken,
                                }),
                              "Lesson deleted.",
                            );
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedLessonId ? (
                  <div className="space-y-3 border-t border-primary/10 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-heading text-lg font-bold text-heading">
                          Lesson content editor
                        </h4>
                        <p className="text-sm text-foreground">
                          Edit lesson metadata, micro-lessons, quizzes, and content blocks.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => {
                          try {
                            const lesson = parseLessonJson();
                            void runAction(
                              () =>
                                updateAdminLesson({
                                  moduleId: selectedModule.id,
                                  lessonId: selectedLessonId,
                                  lesson,
                                  csrfToken,
                                }),
                              "Lesson content saved.",
                            );
                          } catch (error) {
                            setState((current) => ({ ...current, error: error.message }));
                          }
                        }}
                      >
                        Save content
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-sm font-semibold text-heading">
                        Lesson title
                        <input
                          className="w-full rounded-md border border-primary/20 px-3 py-2 font-normal"
                          value={lessonDraft?.title ?? ""}
                          onChange={(event) => updateLessonField("title", event.target.value)}
                        />
                      </label>
                      <label className="space-y-1 text-sm font-semibold text-heading">
                        Learning goal
                        <input
                          className="w-full rounded-md border border-primary/20 px-3 py-2 font-normal"
                          value={lessonDraft?.learningGoal ?? ""}
                          onChange={(event) =>
                            updateLessonField("learningGoal", event.target.value)
                          }
                        />
                      </label>
                    </div>
                    <div className="space-y-3 rounded-xl border border-primary/10 bg-surface-inset p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="font-heading text-lg font-bold text-heading">
                          Micro-lessons
                        </h5>
                        <Button variant="secondary" onClick={addMicroLesson}>
                          Add micro-lesson
                        </Button>
                      </div>
                      {(lessonDraft?.microLessons ?? []).map((microLesson) => (
                        <div
                          key={microLesson.id}
                          className="space-y-3 rounded-lg border border-primary/10 bg-surface-raised p-3"
                        >
                          <div className="flex items-end gap-2">
                            <label className="flex-1 space-y-1 text-sm font-semibold text-heading">
                              Title
                              <input
                                className="w-full rounded-md border border-primary/20 px-3 py-2 font-normal"
                                value={microLesson.title ?? ""}
                                onChange={(event) =>
                                  updateMicroLesson(microLesson.id, "title", event.target.value)
                                }
                              />
                            </label>
                            <Button
                              variant="ghost"
                              className="text-danger"
                              onClick={() => removeMicroLesson(microLesson.id)}
                            >
                              Remove
                            </Button>
                          </div>
                          {(microLesson.microLessonContent ?? []).map((block, blockIndex) =>
                            block.type === "paragraph" || block.type === "callout" ? (
                              <label
                                key={`${microLesson.id}-${blockIndex}`}
                                className="space-y-1 text-sm text-heading"
                              >
                                <span className="font-semibold capitalize">{block.type} text</span>
                                <textarea
                                  className="min-h-20 w-full rounded-md border border-primary/20 px-3 py-2"
                                  value={block.text ?? ""}
                                  onChange={(event) =>
                                    updateBlock(microLesson.id, blockIndex, event.target.value)
                                  }
                                />
                              </label>
                            ) : null,
                          )}
                        </div>
                      ))}
                    </div>
                    <textarea
                      className="min-h-[28rem] w-full rounded-md border border-primary/20 bg-surface-input p-4 font-mono text-sm text-heading"
                      value={lessonJson}
                      onChange={(event) => setLessonJson(event.target.value)}
                      spellCheck="false"
                      aria-label="Lesson JSON content"
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-foreground">Choose a module or create one to manage lessons.</p>
            )}
          </div>
        </div>
      </Card>
    </main>
  );
}
