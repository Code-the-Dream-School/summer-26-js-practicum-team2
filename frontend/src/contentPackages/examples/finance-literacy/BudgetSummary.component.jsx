function BudgetSummary({ content, module }) {
  const budget = module.budgets.find((budget) => budget.budgetId === content.budgetId);

  if (!budget) {
    return <div>Budget not found</div>;
  }

  return (
    <div className="space-y-6 rounded-xl border p-6">
      <h2 className="text-2xl font-bold">{budget.title}</h2>

      {content.show?.income && (
        <section>
          <h3 className="mb-2 font-semibold">Income</h3>

          {budget.income.map((income) => (
            <div key={income.id} className="flex justify-between">
              <span>{income.name}</span>

              <span>${income.amount.toLocaleString()}</span>
            </div>
          ))}
        </section>
      )}

      {content.show?.totals && (
        <section>
          <h3 className="mb-2 font-semibold">Totals</h3>

          <div className="flex justify-between">
            <span>Total Income</span>

            <span>${budget.summary.totalIncome.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>Total Expenses</span>

            <span>${budget.summary.totalExpenses.toLocaleString()}</span>
          </div>
        </section>
      )}

      {content.show?.cashFlow && (
        <section>
          <div className="rounded-lg bg-emerald-50 p-4">
            <div className="font-semibold">Cash Flow</div>

            <div className="text-2xl font-bold text-emerald-700">
              ${budget.summary.netCashFlow.toLocaleString()}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default BudgetSummary;
