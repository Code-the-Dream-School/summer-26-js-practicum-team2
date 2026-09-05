import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OnboardingOverlay from "./OnboardingOverlay.component";

const defaultProps = {
  hasCompleted: false,
  currentStep: 0,
  activePage: "dashboardPage",
  pageName: "dashboardPage",
  onNext: vi.fn(),
  onStart: vi.fn(),
  onSkip: vi.fn(),
};

describe("OnboardingOverlay", () => {
  it("starts the tour from the dashboard banner", () => {
    const onStart = vi.fn();
    render(<OnboardingOverlay {...defaultProps} currentStep={null} onStart={onStart} />);

    fireEvent.click(screen.getByRole("checkbox", { name: /tour sprout/i }));

    expect(onStart).toHaveBeenCalledOnce();
  });

  it("shows only the step for the active page", () => {
    const { rerender } = render(<OnboardingOverlay {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "Welcome to Sprout!" })).toBeInTheDocument();

    rerender(<OnboardingOverlay {...defaultProps} pageName="profilePage" />);
    expect(screen.queryByRole("heading", { name: "Welcome to Sprout!" })).not.toBeInTheDocument();
  });

  it("advances from the popup", () => {
    const onNext = vi.fn();
    render(<OnboardingOverlay {...defaultProps} onNext={onNext} />);

    fireEvent.click(screen.getByRole("button", { name: "Next Step" }));

    expect(onNext).toHaveBeenCalledOnce();
  });
});
