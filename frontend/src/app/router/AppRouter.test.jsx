import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import AppRouter from "./AppRouter";
import { useAuthContext } from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../../shared/MainLayout/MainLayout.component", () => ({
  default: () => <div>Application layout</div>,
}));

describe("AppRouter", () => {
  it("waits for auth hydration before rendering the application layout", () => {
    useAuthContext.mockReturnValue({ isHydrating: true });

    const { rerender } = render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(screen.queryByText("Application layout")).not.toBeInTheDocument();

    useAuthContext.mockReturnValue({ isHydrating: false });
    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByText("Application layout")).toBeInTheDocument();
  });
});
