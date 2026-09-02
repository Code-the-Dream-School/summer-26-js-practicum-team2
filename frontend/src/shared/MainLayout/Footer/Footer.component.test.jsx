import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Footer from "./Footer.component";

const glossary = [{ id: "module-term", term: "Module term", definition: "Only here." }];
const worksCited = [
  {
    id: "module-source",
    title: "Module source",
    citation: "A source for this module.",
    url: "https://example.test/module-source",
  },
];

function renderFooter({ glossaryEntries, worksCitedEntries, path = "/learn/cashFlow/1.1" } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Footer glossary={glossaryEntries} worksCited={worksCitedEntries} />
    </MemoryRouter>,
  );
}

describe("Footer glossary button", () => {
  it("opens glossary and references supplied by the active module", async () => {
    const user = userEvent.setup();
    renderFooter({ glossaryEntries: glossary, worksCitedEntries: worksCited });

    await user.click(screen.getByRole("button", { name: "Open glossary and references" }));

    expect(screen.getByText("Module term")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Works Cited" }));
    expect(screen.getByText("Module source")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Source" })).toHaveAttribute(
      "href",
      "https://example.test/module-source",
    );
  });

  it.each([undefined, [], null])(
    "shows the empty state when module glossary data is %s",
    async (entries) => {
      const user = userEvent.setup();
      renderFooter({ glossaryEntries: entries });

      await user.click(screen.getByRole("button", { name: "Open glossary and references" }));

      expect(screen.getByText("No glossary terms available")).toBeInTheDocument();
      expect(screen.queryByText("Budget")).not.toBeInTheDocument();
    },
  );

  it("closes with Escape and restores focus to the opener", async () => {
    const user = userEvent.setup();
    renderFooter({ glossaryEntries: glossary });

    const opener = screen.getByRole("button", { name: "Open glossary and references" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Glossary and References" });

    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(opener).toHaveFocus();
  });

  it("is not shown outside a lesson route", () => {
    renderFooter({ path: "/dashboard" });

    expect(
      screen.queryByRole("button", { name: "Open glossary and references" }),
    ).not.toBeInTheDocument();
  });
});
