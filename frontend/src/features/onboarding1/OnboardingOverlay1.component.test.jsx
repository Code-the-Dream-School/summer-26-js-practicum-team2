import{ render, screen, fireEvent } from "@testing-library/react";
import OnboardingOverlay from "./OnboardingOverlay1.component";
import ProfilePage from "../../pages/ProfilePage";
import {describe, it,expect, vi} from "vitest";


describe("OnboardingOverlay tests", () => {
 it("does not render or show tour popup when activePage does not match pagename", () => {
  const {container } = render (
  <OnboardingOverlay
  hasCompleted={false}
  currentStep={0}
  activePage="ProfilePage"
  pageName="DashboardPage"
  onNext ={vi.fn()}
  onSkip={vi.fn()}
  />
 )
 expect (container).toBeEmpty();
});

it("popup works and triggers onNext function", () => {
  const handleNext = vi.fn();
  render(
    <OnboardingOverlay
  hasCompleted={false}
  currentStep={0}
  activePage= {ProfilePage}
  pageName= {ProfilePage}
  onNext ={handleNext}
  onSkip={vi.fn()}
  />
  );
  const nextBtn = screen.getByRole("button", {name: /next/i });
  fireEvent.click(nextBtn);
  expect (handleNext).toHaveBeenCalledTimes(1);
});
});