import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import LessonControlPanel from "./LessonControlPanel.component";

// Replace the shared components with simple versions so these tests only focus on panel behavior.
vi.mock("../../../../shared/Card/Card.component", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../../../../shared/Button/Button.component", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("LessonControlPanel", () => {
  it("does not render when there is no saved progress", () => {
    // Without saved progress, there is nothing for the learner to resume or restart.
    render(
      <LessonControlPanel
        savedProgress={null}
        isAtLessonStart={true}
        currentStep={{ title: "Step One" }}
        onStartOver={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Welcome Back! Resuming/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start Over" })).not.toBeInTheDocument();
  });

  it("does not render when learner is already at lesson start", () => {
    // Saved progress at the beginning of the lesson should behave like a normal lesson start.
    render(
      <LessonControlPanel
        savedProgress={{ currentMicroLessonId: "1.1.1", currentChunkIndex: 0 }}
        isAtLessonStart={true}
        currentStep={{ title: "Step One" }}
        onStartOver={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Welcome Back! Resuming/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start Over" })).not.toBeInTheDocument();
  });

  it("renders welcome-back banner and start over button when resuming away from start", () => {
    // Resume from a later step so the learner gets the option to continue or start over.
    render(
      <LessonControlPanel
        savedProgress={{ currentMicroLessonId: "1.1.2", currentChunkIndex: 0 }}
        isAtLessonStart={false}
        currentStep={{ title: "Step Two" }}
        onStartOver={vi.fn()}
      />,
    );

    expect(screen.getByText('Welcome Back! Resuming "Step Two"')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Over" })).toBeInTheDocument();
  });

  it("invokes callback when Start Over is clicked", async () => {
    const user = userEvent.setup();
    const onStartOver = vi.fn();

    render(
      <LessonControlPanel
        savedProgress={{ currentMicroLessonId: "1.1.2", currentChunkIndex: 1 }}
        isAtLessonStart={false}
        currentStep={{ title: "Step Two" }}
        onStartOver={onStartOver}
      />,
    );

    // Clicking Start Over should hand the restart action back to the parent component.
    await user.click(screen.getByRole("button", { name: "Start Over" }));

    expect(onStartOver).toHaveBeenCalledTimes(1);
  });
});
