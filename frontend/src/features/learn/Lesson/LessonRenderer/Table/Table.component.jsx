function Table({ content, module }) {
  // Check if the module is available
  if (!module) return <div>Module not found</div>;
  // Check if the content is available
  const tableId = content?.tableId || content.budgetId;
  // If tableId is not provided, default to the first table in the module
  const table = module.tables?.find((table) => table.tableId === tableId);

  if (!table) {
    return <div>Table not found</div>;
  }
  // Find the budget associated with the table
  const budgetId = content.budgetId;
  // If budgetId is not provided, default to the first budget in the module
  const budget = budgetId
    ? module.budgets?.find((b) => b.budgetId === budgetId)
    : module.budgets?.[0];

  if (!budget) {
    return <div>Budget not found</div>;
  }
  let rows = [];

  if (table.incomeRefs) {
    rows = table.incomeRefs
      .map((incomeRef) => budget.income.find((income) => income.id === incomeRef))
      .filter(Boolean);
  }

  if (table.expenseRefs) {
    const allExpenses = [
      ...budget.fixedExpenses.needs,
      ...budget.fixedExpenses.wants,
      ...budget.variableExpenses.needs,
      ...budget.variableExpenses.wants,
    ];

    rows = table.expenseRefs
      .map((expenseRef) => allExpenses.find((expense) => expense.id === expenseRef))
      .filter(Boolean);
  }

  return (
    <div>
      <h3>{table.title}</h3>

      <table>
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-4 py-2">{row.name}</td>
              <td className="border px-4 py-2">${row.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
