//Test verifie floating button renders when module has active glossary data, click button will open glossary modal, button can be accessed by keyboard
import { MemoryRouter } from "react-router";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Footer from "./Footer.component";
import userEvent from "@testing-library/user-event";
//Mock GlossaryModal so we test Footer
vi.mock("../../../features/learn/GlossaryModal/GlossaryModal.component.jsx", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="mock-glossary-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

const mockGlossary = [{ term: "Budget", definition: "Spending plan." }];

describe("Footer - Floating Glossary Button", () => {
  it("renders floating glossary button when glossary exists", () => {
    render(
      <MemoryRouter initialEntries={["/learn"]}>
        <Footer currentGlossary={mockGlossary} />
      </MemoryRouter>,
    );
    const glossaryBtn = screen.getByRole("button", {
      name: /open glossary/i,
    });
    expect(glossaryBtn).toBeInTheDocument();
  });
  it("opens the GlossaryModal when the floating button is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/learn"]}>
        <Footer currentGlossary={mockGlossary} />
      </MemoryRouter>,
    );
    const glossaryBtn = screen.getByRole("button", {
      name: /open glossary/i,
    });
    //modal should be closed on default
    expect(screen.queryByTestId("mock-glossary-modal")).not.toBeInTheDocument();
    //click to open modal
    fireEvent.click(glossaryBtn);
    expect(screen.getByTestId("mock-glossary-modal")).toBeInTheDocument();
  });
  it("closes the GlossaryModal when onClose is chosen inside modal", () => {
    render(
      <MemoryRouter initialEntries={["/learn"]}>
        <Footer currentGlossary={mockGlossary} />
      </MemoryRouter>,
    );
    // open modal
    const glossaryBtn = screen.getByRole("button", {
      name: /open glossary/i,
    });
    fireEvent.click(glossaryBtn);
    // close modal with mock button
    const closeBtn = screen.getByText("Close Modal");
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId("mock-glossary-modal")).not.toBeInTheDocument();
  });
  it("is keyboard accessible and can make choices when enter key is pressed", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/learn"]}>
        <Footer currentGlossary={mockGlossary} />
      </MemoryRouter>,
    );
    const glossaryBtn = screen.getByRole("button", {
      name: /open glossary/i,
    });
    //Simulate enter button
    glossaryBtn.focus();
    await user.keyboard("{Enter}");
    //fireEvent.keyDown(glossaryBtn, { key: "Enter", code: "Enter" });
    expect(screen.getByTestId("mock-glossary-modal")).toBeInTheDocument();
  });
});

///check if glossary button is hidden on non-allowed routes

describe("Footer - Floating Glossary Button(Hidden)", () => {
  it("will not render floating glossary button on non-allowed routes", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Footer currentGlossary={mockGlossary} />
      </MemoryRouter>,
    );
    const glossaryBtn = screen.queryByRole("button", {
      name: /open glossary/i,
    });
    expect(glossaryBtn).not.toBeInTheDocument();
  });
  it("render floating glossary button using default fallback data when current glossary is empty", () => {
    render(
      <MemoryRouter initialEntries={["/learn"]}>
        <Footer currentGlossary={[]} />
      </MemoryRouter>,
    );
    const glossaryBtn = screen.getByRole("button", {
      name: /open glossary/i,
    });
    expect(glossaryBtn).toBeInTheDocument();
  });
});
