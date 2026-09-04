import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./VerifyEmailPage";

const mockAuth = { verifyEmail: vi.fn() };

// Mock authentication so these tests can control the verification response.
vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => mockAuth,
}));

describe("verify email page", () => {
  beforeEach(() => {
    // Clear any previous verification calls before each test.
    vi.clearAllMocks();
  });

  it("shows a missing-token error without calling verification", () => {
    // Start on the verification page without a token in the URL.
    render(
      <MemoryRouter initialEntries={["/verify"]}>
        <Routes>
          <Route path="/verify" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Without a token, verification should stop before calling the auth function.
    expect(screen.getByRole("alert")).toHaveTextContent("Missing verification token.");
    expect(mockAuth.verifyEmail).not.toHaveBeenCalled();
  });

  it("shows pending status while verification is unresolved", () => {
    // Keep the verification request pending so the loading state stays visible.
    mockAuth.verifyEmail.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={["/verify?token=token-1"]}>
        <Routes>
          <Route path="/verify" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Verifying your email/)).toBeInTheDocument();
    expect(mockAuth.verifyEmail).toHaveBeenCalledWith("token-1");
  });

  it("shows success and redirects to the dashboard after verification", async () => {
    // Return a successful verification response without making a real API request.
    mockAuth.verifyEmail.mockResolvedValue({ user: { id: "user-1" } });

    render(
      <MemoryRouter initialEntries={["/verify?token=token-1"]}>
        <Routes>
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // The success message should appear before the page redirects to the dashboard.
    await waitFor(() => expect(screen.getByText("You're in!")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Dashboard page")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("shows the server failure as an alert", async () => {
    // Pretend the verification request failed because the link is no longer valid.
    mockAuth.verifyEmail.mockRejectedValue(new Error("Verification link expired."));

    render(
      <MemoryRouter initialEntries={["/verify?token=expired"]}>
        <Routes>
          <Route path="/verify" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The error returned from verification should be shown to the user.
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Verification link expired.");
    });
  });
});
