import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { describe, expect, it, vi } from "vitest";
import MainLayout from "./MainLayout.component";

// Mock auth so the layout renders without depending on a real user session.
vi.mock("../../context/AuthContext", () => ({
  useAuthContext: () => ({ isAuthenticated: false, user: null, logout: vi.fn() }),
}));

  describe("check correct mapping of /profile path in MainLayout component to profilePage content", () => {
    it("renders profile view when visiting /profile ", () => {
      render(
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route element={<MainLayout />}>
            <Route path="/profile" element={<div data-testid="profile">Profile</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByTestId("profile")).toBeInTheDocument();
    });
  });
