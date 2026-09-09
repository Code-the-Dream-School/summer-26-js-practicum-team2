import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OAuthButtons from "./OAuthButtons.component";

const { mockGetOAuthProviders } = vi.hoisted(() => ({
  mockGetOAuthProviders: vi.fn(),
}));

vi.mock("../../services/api", () => ({
  getOAuthProviders: mockGetOAuthProviders,
  getOAuthUrl: (provider, tosAccepted = false, next) => {
    const query = new URLSearchParams();
    if (tosAccepted) query.set("tos", "true");
    if (next) query.set("next", next);
    return `/api/v1/auth/${provider}${query.size ? `?${query}` : ""}`;
  },
}));

const renderOAuthButtons = () =>
  render(
    <MemoryRouter>
      <OAuthButtons />
    </MemoryRouter>,
  );

describe("OAuthButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows only configured providers", async () => {
    mockGetOAuthProviders.mockResolvedValue({ google: true, github: false });

    renderOAuthButtons();

    expect(screen.queryByText("or")).not.toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Continue with Google" })).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue with GitHub" })).not.toBeInTheDocument();
  });

  it("includes Terms agreement in provider links without a separate checkbox", async () => {
    mockGetOAuthProviders.mockResolvedValue({ google: true, github: true });

    renderOAuthButtons();

    const googleLink = await screen.findByRole("link", { name: "Continue with Google" });
    expect(googleLink).toHaveAttribute("href", "/api/v1/auth/google?tos=true");
    expect(screen.getByRole("link", { name: "Continue with GitHub" })).toHaveAttribute(
      "href",
      "/api/v1/auth/github?tos=true",
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("hides all OAuth actions when provider availability cannot be loaded", async () => {
    mockGetOAuthProviders.mockRejectedValue(new Error("Unavailable"));

    await act(async () => {
      renderOAuthButtons();
    });

    expect(screen.queryByRole("link", { name: /Continue with/i })).not.toBeInTheDocument();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
  });
});
