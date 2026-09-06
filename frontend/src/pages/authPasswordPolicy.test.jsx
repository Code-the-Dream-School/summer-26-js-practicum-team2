import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";
import PasswordResetPage from "./PasswordResetPage";
import { ROUTES } from "../app/router/routes";
import { useAuthContext } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.REGISTER]}>
      <Routes>
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.LOGIN} element={<h1>Login Page</h1>} />
        <Route path={ROUTES.TERMS} element={<h1>Terms</h1>} />
        <Route path={ROUTES.PRIVACY} element={<h1>Privacy</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderResetConfirmPage() {
  return render(
    <MemoryRouter initialEntries={[`${ROUTES.PASSWORD_RESET}?token=${"a".repeat(64)}`]}>
      <Routes>
        <Route path={ROUTES.PASSWORD_RESET} element={<PasswordResetPage />} />
        <Route path={ROUTES.LOGIN} element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("auth form password policy UX", () => {
  const registerUser = vi.fn();
  const requestPasswordReset = vi.fn();
  const confirmPasswordReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthContext.mockReturnValue({
      register: registerUser,
      requestPasswordReset,
      confirmPasswordReset,
    });
  });

  it("shows conditional helper text on register and reset", async () => {
    const user = userEvent.setup();
    const registerView = renderRegisterPage();

    expect(
      screen.getByText(
        "Use 8+ characters with upper and lower case letters, a number, and a symbol.",
      ),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Password"), "YxNqSSe9uqCCVAE");

    expect(
      screen.getByText("Use 15+ characters with upper and lower case letters plus a number."),
    ).toBeInTheDocument();

    registerView.unmount();

    renderResetConfirmPage();

    expect(
      screen.getByText(
        "Use 8+ characters with upper and lower case letters, a number, and a symbol.",
      ),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("New password"), "YxNqSSe9uqCCVAE");

    expect(
      screen.getByText("Use 15+ characters with upper and lower case letters plus a number."),
    ).toBeInTheDocument();
  });

  it("shows the policy error and blocks registration submit for invalid passwords", async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText("Name"), "Taylor");
    await user.type(screen.getByLabelText("Email"), "taylor@example.com");
    await user.type(screen.getByLabelText("Password"), "VeryLongPasswordWithoutDigits");
    await user.type(screen.getByLabelText("Confirm password"), "VeryLongPasswordWithoutDigits");
    await user.click(
      screen.getByRole("checkbox", { name: /I agree to the Terms of Service and Privacy Policy/i }),
    );
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText(
        "Password must be at least 15 characters long and include upper and lower case letters and a number, or at least 8 characters long and include upper and lower case letters, a number, and a special character.",
      ),
    ).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("shows the policy error and blocks reset submit for invalid passwords", async () => {
    const user = userEvent.setup();
    renderResetConfirmPage();

    await user.type(screen.getByLabelText("New password"), "Password1 ");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(
      await screen.findByText(
        "Password must be at least 15 characters long and include upper and lower case letters and a number, or at least 8 characters long and include upper and lower case letters, a number, and a special character.",
      ),
    ).toBeInTheDocument();

    expect(confirmPasswordReset).not.toHaveBeenCalled();
  });
});
