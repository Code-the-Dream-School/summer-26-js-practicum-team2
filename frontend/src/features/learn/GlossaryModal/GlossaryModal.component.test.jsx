import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GlossaryModal from "./GlossaryModal.component";

const glossary = [
  { id: "apr", term: "APR", definition: "The yearly cost of borrowing money." },
  { id: "budget", term: "Budget", definition: "A plan for your money." },
  { id: "debt", term: "Debt", definition: "Money you owe." },
];

const worksCited = [
  {
    id: "source-1",
    title: "Financial education source",
    author: "Consumer Financial Protection Bureau",
    citation: "Consumer Financial Protection Bureau. Financial education source.",
    url: "https://example.test/source",
  },
];

describe("GlossaryModal", () => {
  it("renders supplied glossary terms in a named dialog", () => {
    render(<GlossaryModal isOpen onClose={vi.fn()} glossary={glossary} worksCited={worksCited} />);

    expect(screen.getByRole("dialog", { name: "Glossary and References" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Glossary terms list with definitions" }),
    ).toHaveTextContent("APR");
    expect(screen.getByText("The yearly cost of borrowing money.")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("shows the module's Works Cited data with ordinary button semantics", async () => {
    const user = userEvent.setup();
    render(<GlossaryModal isOpen onClose={vi.fn()} glossary={glossary} worksCited={worksCited} />);

    const worksCitedButton = screen.getByRole("button", { name: "Works Cited" });
    await user.click(worksCitedButton);

    expect(worksCitedButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: "Works cited sources list" })).toHaveTextContent(
      "Financial education source",
    );
    expect(screen.getByRole("link", { name: "View Source" })).toHaveAttribute(
      "href",
      "https://example.test/source",
    );
  });

  it("labels the search input and filters the glossary", async () => {
    const user = userEvent.setup();
    render(<GlossaryModal isOpen onClose={vi.fn()} glossary={glossary} />);

    await user.type(screen.getByRole("textbox", { name: "Search glossary terms" }), "Budget");

    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.queryByText("Debt")).not.toBeInTheDocument();
  });

  it.each([undefined, [], null])("shows the empty glossary state when data is %s", (data) => {
    render(<GlossaryModal isOpen onClose={vi.fn()} glossary={data} />);

    expect(screen.getByText("No glossary terms available")).toBeInTheDocument();
    expect(screen.getByText("There are no glossary terms for this module")).toBeInTheDocument();
  });

  it("shows an empty Works Cited state when the module has no sources", async () => {
    const user = userEvent.setup();
    render(<GlossaryModal isOpen onClose={vi.fn()} glossary={glossary} worksCited={[]} />);

    await user.click(screen.getByRole("button", { name: "Works Cited" }));

    expect(screen.getByText("No resources available")).toBeInTheDocument();
  });

  it("delegates Escape handling to the shared modal", () => {
    const onClose = vi.fn();
    render(<GlossaryModal isOpen onClose={onClose} glossary={glossary} />);

    fireEvent(
      screen.getByRole("dialog", { name: "Glossary and References" }),
      new Event("cancel", { cancelable: true }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });
});
