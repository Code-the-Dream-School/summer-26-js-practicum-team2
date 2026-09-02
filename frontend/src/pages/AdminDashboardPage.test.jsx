import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "./AdminDashboardPage";
import { useAuthContext } from "../context/AuthContext";
import {
  approveDeleteAccount,
  getAdminModules,
  getAdminUsers,
  getPendingDeleteAccount,
  rejectDeleteAccount,
} from "../services/api";

vi.mock("../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../services/api", () => ({
  approveDeleteAccount: vi.fn(),
  createAdminLesson: vi.fn(),
  createAdminModule: vi.fn(),
  deleteAdminLesson: vi.fn(),
  deleteAdminModule: vi.fn(),
  getAdminModules: vi.fn(),
  getAdminUsers: vi.fn(),
  getPendingDeleteAccount: vi.fn(),
  hardDeleteAdminUser: vi.fn(),
  importAdminLessonModule: vi.fn(),
  rejectDeleteAccount: vi.fn(),
  resetAdminUserProgress: vi.fn(),
  seedAdminBudgetingModule: vi.fn(),
  seedAdminRandomUsers: vi.fn(),
  setAdminUserDisabled: vi.fn(),
  setAdminUserDeleted: vi.fn(),
  updateAdminLesson: vi.fn(),
  updateAdminModule: vi.fn(),
  updateAdminUserRole: vi.fn(),
  verifyAdminUserEmail: vi.fn(),
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    useAuthContext.mockReturnValue({ csrfToken: "csrf-token", user: { id: "admin-123" } });
    getAdminUsers.mockResolvedValue({ users: [] });
    getAdminModules.mockResolvedValue({ modules: [] });
    getPendingDeleteAccount.mockResolvedValue({
      users: [
        {
          _id: "user-123",
          name: "Pending learner",
          email: "learner@example.com",
          deletion_requested_at: "2026-09-01T00:00:00.000Z",
        },
      ],
    });
    approveDeleteAccount.mockResolvedValue({});
    rejectDeleteAccount.mockResolvedValue({});
  });

  it("passes the pending user's ID and CSRF token to deletion review actions", async () => {
    const user = userEvent.setup();
    render(<AdminDashboardPage />);

    await user.click(await screen.findByRole("button", { name: "Approve deletion" }));
    await waitFor(() => {
      expect(approveDeleteAccount).toHaveBeenCalledWith("user-123", "csrf-token");
    });

    await user.click(screen.getByRole("button", { name: "Reject" }));
    await waitFor(() => {
      expect(rejectDeleteAccount).toHaveBeenCalledWith("user-123", "csrf-token");
    });
  });
});
