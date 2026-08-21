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
  }

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
                    className="flex items-center justify-between border-b border-primary/10 py-2"
                  >
                    <span className="text-foreground">{lesson.title}</span>
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
                ))}
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
