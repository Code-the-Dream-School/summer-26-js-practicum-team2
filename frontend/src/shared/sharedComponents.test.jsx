import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button/Button.component";
import Card from "./Card/Card.component";
import EmptyState from "./EmptyState/EmptyState.component";
import Input from "./Input/Input.component";
import Modal from "./Modal/Modal.component";
import Spinner from "./Spinner/Spinner.component";
import Textarea from "./Textarea/Textarea.component";
import Toast from "./Toast/Toast.component";

describe("shared components", () => {
  it("connects field labels, helper text, errors, and disabled state", () => {
    render(
      <>
        <Input
          id="email"
          label="Email"
          helperText="Use your account email."
          error="Email is required."
        />
        <Textarea id="notes" label="Notes" helperText="Optional notes." disabled />
      </>,
    );

    // Find the fields by their accessible labels instead of relying on test IDs
    const email = screen.getByRole("textbox", { name: "Email" });
    const notes = screen.getByRole("textbox", { name: "Notes" });

    // Errors and helper text should be connected to the fields for assistive technology
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Use your account email. Email is required.");
    expect(notes).toBeDisabled();
    expect(notes).toHaveAccessibleDescription("Optional notes.");
  });

  it("supports button loading and disabled states", () => {
    render(
      <>
        <Button loading>Save</Button>
        <Button disabled>Delete</Button>
      </>,
    );

    // Loading and disabled buttons should not allow the user to interact with them
    expect(screen.getByRole("button", { name: "Loading..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("activates interactive cards with Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card interactive onClick={onClick} role="button">
        Choose this lesson
      </Card>,
    );

    // Keyboard users should be able to activate the card the same way they would a button
    const card = screen.getByRole("button", { name: "Choose this lesson" });
    card.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("traps modal focus, closes on request, and restores the trigger focus", () => {
    const onClose = vi.fn();

    // Create a trigger outside the modal so we can make sure focus returns to it when the modal closes
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="Confirm action" description="Choose an option.">
        <button type="button">Confirm</button>
      </Modal>,
    );

    // Opening the modal should move focus inside it.
    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    expect(closeButton).toHaveFocus();

    // Tabbing past the last focusable item should wrap focus back to the beginning
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    confirmButton.focus();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Tab" });
    expect(closeButton).toHaveFocus();

    // Closing the modal should restore focus to the element that opened it
    rerender(
      <Modal isOpen={false} onClose={onClose} title="Confirm action">
        <button type="button">Confirm</button>
      </Modal>,
    );

    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("announces toast and spinner status to assistive technology", () => {
    const onClose = vi.fn();

    render(
      <>
        <Toast isOpen message="Saved successfully" onClose={onClose} duration={0} />
        <Spinner label="Loading lessons" />
        <EmptyState title="No lessons yet" message="Start your first lesson." />
      </>,
    );

    // The toast and spinner should expose status updates that screen readers can announce
    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
    expect(screen.getByText(/Loading lessons/)).toBeInTheDocument();

    // The empty state should still provide a clear heading and message.
    expect(screen.getByRole("heading", { name: "No lessons yet" })).toBeInTheDocument();
    expect(screen.getByText("Start your first lesson.")).toBeInTheDocument();
  });
});
