import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

const mockAuth = {
  login: vi.fn(),
  register: vi.fn(),
};

// Use mocked auth functions so these tests can focus on the page behavior.
vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => mockAuth,
}));

describe("auth pages", () => {
  beforeEach(() => {
    // Reset the auth mocks before each test so calls do not carry over.
    vi.clearAllMocks();
  });

  it("logs in and redirects to the requested next page", async () => {
    const user = userEvent.setup();

    // Return a successful login response without making a real API request.
    mockAuth.login.mockResolvedValue({ user: { id: "u-1" }, csrfToken: "csrf-1" });

    // Start on login with a next URL so we can make sure the user is sent back there.
    render(
      <MemoryRouter initialEntries={["/login?next=%2Flearn%2FcashFlow%2F1.1"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/learn/cashFlow/1.1" element={<div>Lesson page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), "learner@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "SecurePass123!");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    // Make sure the form sends the values entered by the user.
    await waitFor(() => {
      expect(mockAuth.login).toHaveBeenCalledWith({
        email: "learner@example.com",
        password: "SecurePass123!",
        remember: false,
      });
    });

    // A successful login should redirect to the page from the next query parameter.
    await waitFor(() => {
      expect(screen.getByText("Lesson page")).toBeInTheDocument();
    });
  });

  it("shows the login error returned by the server", async () => {
    const user = userEvent.setup();

    // Pretend the server rejected the login with an authentication error.
    mockAuth.login.mockRejectedValue(new Error("Invalid email or password."));

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), "learner@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "WrongPass123!");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    // The server error should be shown to the user instead of redirecting.
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password.");
    });
  });

  it("registers a user and shows the verification message on success", async () => {
    const user = userEvent.setup();

    // Return a successful registration response without making a real API request.
    mockAuth.register.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^name$/i), "Test User");
    await user.type(screen.getByLabelText(/^email$/i), "new@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "SecurePass123!");
    await user.type(screen.getByLabelText(/^confirm password$/i), "SecurePass123!");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Make sure registration receives the values entered in the form.
    await waitFor(() => {
      expect(mockAuth.register).toHaveBeenCalledWith({
        name: "Test User",
        email: "new@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        tos: true,
      });
    });

    // Successful registration should tell the user to verify their email.
    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
  });

  it("shows a field-level email error when registration conflicts", async () => {
    const user = userEvent.setup();

    // Pretend the server returned a conflict because the email is already registered.
    mockAuth.register.mockRejectedValue({ status: 409, message: "That email is already in use." });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^name$/i), "Test User");
    await user.type(screen.getByLabelText(/^email$/i), "taken@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "SecurePass123!");
    await user.type(screen.getByLabelText(/^confirm password$/i), "SecurePass123!");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // The registration conflict should be shown as an error for the email field.
    await waitFor(() => {
      expect(screen.getByText("That email is already in use.")).toBeInTheDocument();
    });
  });
});
