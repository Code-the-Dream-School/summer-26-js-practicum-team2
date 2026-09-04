import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "./routes";
import { useAuthContext } from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthContext.mockReturnValue({
      isAuthenticated: false,
      isHydrating: false,
    });
  });

  it("redirects an unauthenticated visitor to login", () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.PROFILE]}>
        <Routes>
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <h1>Protected profile</h1>
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.LOGIN} element={<h1>Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Protected profile" })).not.toBeInTheDocument();
  });
});
