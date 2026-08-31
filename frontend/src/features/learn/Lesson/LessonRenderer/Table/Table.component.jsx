function Table({ content, module }) {
  // Check if the module is available
  if (!module) return <div>Module not found</div>;
  // Check if the content is available
  const tableId = content?.tableId ?? content?.budgetId;
  // If tableId is not provided, default to the first table in the module
  const table = tableId
    ? module.tables?.find((item) => item.tableId === tableId)
    : module.tables?.[0];

  if (!table) {
    return <div>Table not found</div>;
  }
  // Find the budget associated with the table
  const budgetId = content?.budgetId;
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
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div>
      <h3>{table.title}</h3>
      <div className="overflow-x-auto">
        <table
          className="w-full table-auto border-collapse border border-slate-300 text-left"
          aria-labelledby={`table-title-${table.tableId}`}
        >
          <caption id={`table-title-${table.tableId}`} className="sr-only">
            {table.title}
          </caption>
          <thead className="bg-slate-100">
            <tr>
              {table.headers.map((header) => (
                <th
                  scope="col"
                  key={header}
                  className="border border-slate-300 px-4 py-2 font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="even:bg-slate-50">
                <td className="border border-slate-300 px-4 py-2">{row.name}</td>
                <td className="border border-slate-300 px-4 py-2">
                  {currencyFormatter.format(row.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
