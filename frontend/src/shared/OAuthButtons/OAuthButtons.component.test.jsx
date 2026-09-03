import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OAuthButtons from "./OAuthButtons.component";

const { mockGetOAuthProviders } = vi.hoisted(() => ({
  mockGetOAuthProviders: vi.fn(),
}));

vi.mock("../../services/api", () => ({
  getOAuthProviders: mockGetOAuthProviders,
  getOAuthUrl: (provider, tosAccepted = false) =>
    `/api/v1/auth/${provider}${tosAccepted ? "?tos=true" : ""}`,
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

    expect(await screen.findByRole("link", { name: "Continue with Google" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue with GitHub" })).not.toBeInTheDocument();
  });

  it("passes Terms consent to the OAuth provider when the checkbox is checked", async () => {
    const user = userEvent.setup();
    mockGetOAuthProviders.mockResolvedValue({ google: true, github: true });

    renderOAuthButtons();

    const googleLink = await screen.findByRole("link", { name: "Continue with Google" });
    expect(googleLink).toHaveAttribute("href", "/api/v1/auth/google");

    // After checking the Terms checkbox, the OAuth URLs should include the tos parameter
    await user.click(
      screen.getByRole("checkbox", { name: "Agree to Terms of Service and Privacy Policy" }),
    );
    expect(googleLink).toHaveAttribute("href", "/api/v1/auth/google?tos=true");
    expect(screen.getByRole("link", { name: "Continue with GitHub" })).toHaveAttribute(
      "href",
      "/api/v1/auth/github?tos=true",
    );

    // After unchecking, the URLs should not include the tos parameter
    await user.click(
      screen.getByRole("checkbox", { name: "Agree to Terms of Service and Privacy Policy" }),
    );
    expect(googleLink).toHaveAttribute("href", "/api/v1/auth/google");
    expect(screen.getByRole("link", { name: "Continue with GitHub" })).toHaveAttribute(
      "href",
      "/api/v1/auth/github",
    );
  });

  it("hides all OAuth actions when provider availability cannot be loaded", async () => {
    mockGetOAuthProviders.mockRejectedValue(new Error("Unavailable"));

    renderOAuthButtons();

    await vi.waitFor(() => {
      expect(screen.queryByRole("link", { name: /Continue with/i })).not.toBeInTheDocument();
    });
  });
});
