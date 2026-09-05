import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "../app/router/ProtectedRoute";
import PasswordResetPage from "./PasswordResetPage";

const mockAuth = {
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  isAuthenticated: false,
  isHydrating: false,
};

// Use mocked auth values so these tests can control the reset and protected route behavior.
vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => mockAuth,
}));

describe("password reset and protected route flow", () => {
  beforeEach(() => {
    // Reset the mocks and auth state before each test.
    vi.clearAllMocks();
    mockAuth.isAuthenticated = false;
    mockAuth.isHydrating = false;
  });

  it("requests a reset email and shows the reset link notice", async () => {
    const user = userEvent.setup();

    // Return a successful reset response with the development reset link.
    mockAuth.requestPasswordReset.mockResolvedValue({
      message: "Password reset link sent.",
      devPasswordReset: { resetUrl: "https://example.test/reset?token=abc123" },
    });

    render(
      <MemoryRouter initialEntries={["/reset-password"]}>
        <Routes>
          <Route path="/reset-password" element={<PasswordResetPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), "learner@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    // Make sure the reset request uses the email entered in the form.
    await waitFor(() => {
      expect(mockAuth.requestPasswordReset).toHaveBeenCalledWith("learner@example.com");
    });

    // The development reset link should be shown after a successful request.
    await waitFor(() => {
      expect(screen.getByText(/https:\/\/example.test\/reset\?token=abc123/i)).toBeInTheDocument();
    });
  });

  it("redirects unauthenticated users to login before showing protected content", async () => {
    // Start on a protected route while the mocked user is logged out.
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    // ProtectedRoute should redirect the user to the login page.
    await waitFor(() => {
      expect(screen.getByText("Login page")).toBeInTheDocument();
    });
  });

  it("allows authenticated users to reach protected content", async () => {
    // Pretend the user is already authenticated before visiting the protected route.
    mockAuth.isAuthenticated = true;

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    // Authenticated users should be allowed to see the protected page.
    await waitFor(() => {
      expect(screen.getByText("Dashboard page")).toBeInTheDocument();
    });
  });
});
