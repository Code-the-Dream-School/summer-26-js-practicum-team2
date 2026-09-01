import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboard from "./AdminDashboard";
import { useAuthContext } from "../context/AuthContext";
import useAdminDashboardData from "../hooks/useAdminDashboardData";
import { approveDeleteAccount, rejectDeleteAccount } from "../services/api";

vi.mock("../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../hooks/useAdminDashboardData", () => ({
  default: vi.fn(),
}));

vi.mock("../services/api", () => ({
  approveDeleteAccount: vi.fn(),
  rejectDeleteAccount: vi.fn(),
}));

describe("AdminDashboard", () => {
  const refreshAdminData = vi.fn();

  beforeEach(() => {
    useAuthContext.mockReturnValue({ csrfToken: "csrf-token" });
    useAdminDashboardData.mockReturnValue({
      pendingDeletions: [{ _id: "user-123", email: "learner@example.com" }],
      users: [],
      isLoading: false,
      error: "",
      refreshAdminData,
    });
    approveDeleteAccount.mockResolvedValue({});
    rejectDeleteAccount.mockResolvedValue({});
  });

  it("passes a user ID and CSRF token to deletion actions", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await user.click(screen.getByRole("button", { name: "Approve Deletion" }));
    expect(approveDeleteAccount).toHaveBeenCalledWith("user-123", "csrf-token");

    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(rejectDeleteAccount).toHaveBeenCalledWith("user-123", "csrf-token");
  });
});
