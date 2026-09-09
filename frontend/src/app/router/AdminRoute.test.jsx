import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminRoute from "./AdminRoute";
import { ROUTES } from "./routes";
import { useAuthContext } from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

describe("AdminRoute", () => {
  beforeEach(() => {
    useAuthContext.mockReturnValue({
      user: { role: "learner" },
      isAuthenticated: true,
      isHydrating: false,
    });
  });

  it("redirects authenticated non-admin users to their dashboard", () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.ADMIN_DASHBOARD]}>
        <Routes>
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <AdminRoute>
                <h1>Admin dashboard</h1>
              </AdminRoute>
            }
          />
          <Route path={ROUTES.DASHBOARD} element={<h1>User dashboard</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "User dashboard" })).toBeInTheDocument();
  });
});
