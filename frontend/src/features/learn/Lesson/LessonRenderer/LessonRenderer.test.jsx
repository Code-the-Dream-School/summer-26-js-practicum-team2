import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import LessonRenderer from "./LessonRenderer.component";

// Provide the table and budget data needed by the lesson content that depends on module data.
const moduleData = {
  tables: [
    {
      tableId: "income-table",
      title: "Monthly income",
      headers: ["Name", "Amount"],
      incomeRefs: ["salary"],
    },
  ],
  budgets: [
    {
      budgetId: "budget-1",
      title: "Sample budget",
      income: [{ id: "salary", name: "Salary", amount: 2000 }],
      fixedExpenses: { needs: [], wants: [] },
      variableExpenses: { needs: [], wants: [] },
      summary: { totalIncome: 2000, totalExpenses: 500, netCashFlow: 1500 },
    },
  ],
};

describe("LessonRenderer", () => {
  it("renders every supported lesson content type", async () => {
    const user = userEvent.setup();

    // Start with one content type and reuse the same render for the rest of the supported types.
    const { rerender } = render(
      <LessonRenderer content={{ type: "paragraph", text: "Paragraph text" }} />,
    );

    expect(screen.getByText("Paragraph text")).toBeInTheDocument();

    rerender(<LessonRenderer content={{ type: "characterIntro", text: "Meet Abigail" }} />);
    expect(screen.getByText("Meet Abigail")).toBeInTheDocument();

    rerender(
      <LessonRenderer content={{ type: "formula", text: "Income - Expenses = Cash Flow" }} />,
    );
    expect(screen.getByText("Income - Expenses = Cash Flow")).toBeInTheDocument();

    rerender(<LessonRenderer content={{ type: "callout", text: "Remember this" }} />);
    expect(screen.getByText("Key Takeaway")).toBeInTheDocument();
    expect(screen.getByText("Remember this")).toBeInTheDocument();

    rerender(
      <LessonRenderer
        content={{ type: "unorderedList", intro: "Track these:", items: ["Income", "Expenses"] }}
      />,
    );
    expect(screen.getByText("Track these:")).toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveTextContent("Income");

    // Knowledge checks need a little interaction before their feedback is shown.
    rerender(
      <LessonRenderer
        content={{
          type: "knowledgeCheck",
          question: "What should you track?",
          answerChoices: [{ key: "a", text: "Expenses" }],
          correctResponse: "a",
          explanation: "Track expenses.",
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Expenses" }));
    await user.click(screen.getByRole("button", { name: "Check Answer" }));
    expect(screen.getByText("✅ Correct!")).toBeInTheDocument();

    // Table content uses the matching table and budget information from the module.
    rerender(
      <LessonRenderer content={{ type: "table", tableId: "income-table" }} module={moduleData} />,
    );
    expect(screen.getByRole("table", { name: "Monthly income" })).toHaveTextContent("$2,000.00");

    // Budget summaries should pull the requested values from the matching budget.
    rerender(
      <LessonRenderer
        content={{
          type: "budget-summary",
          budgetId: "budget-1",
          show: { income: true, totals: true, cashFlow: true },
        }}
        module={moduleData}
      />,
    );
    expect(screen.getByRole("heading", { name: "Sample budget" })).toBeInTheDocument();
    expect(screen.getByText("$1,500")).toBeInTheDocument();
  });

  it("renders safe fallbacks for missing or unknown content", () => {
    // Missing content should show the normal empty fallback.
    const { rerender } = render(<LessonRenderer />);
    expect(screen.getByText("No content found")).toBeInTheDocument();

    // Unknown future content types should fail quietly instead of showing raw content data.
    rerender(<LessonRenderer content={{ type: "future-block" }} />);
    expect(screen.queryByText("No content found")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("future-block");
  });
});
