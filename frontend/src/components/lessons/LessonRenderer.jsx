function LessonRenderer({ content, module }) {
  console.log('Renderer content:', content)

  if (!content) {
    return <div>No content found</div>
  }

  switch (content.type) {
    case 'paragraph':
      return <p>{content.text}</p>

    case 'characterIntro':
      return <h3>{content.text}</h3>

    case 'formula':
      return <div className="rounded-lg bg-slate-100 p-4 font-mono">{content.text}</div>

    case 'callout':
      return (
        <div className="rounded-lg border-l-4 border-primary bg-slate-50 p-4">{content.text}</div>
      )

    case 'example':
      return <div className="rounded-lg bg-emerald-50 p-4">{content.text}</div>

    case 'unorderedList':
      return (
        <ul className="list-disc pl-6">
          {content.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'knowledgeCheck':
      return (
        <div>
          <h3>{content.question}</h3>

          {content.answerChoices.map((choice) => (
            <div key={choice.key}>{choice.text}</div>
          ))}
        </div>
      )

    case 'table': {
      const table = module.tables.find((table) => table.tableId === content.tableId)

      if (!table) {
        return <div>Table not found</div>
      }

      const budget = module.budgets[0]

      const rows =
        table.incomeRefs?.map((incomeRef) =>
          budget.income.find((income) => income.id === incomeRef),
        ) ?? []

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
                  <td className="border px-4 py-2">${row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'budget-summary':
      return <div>Budget Summary: {content.budgetId}</div>

    default:
      console.log(
        'Unsupported content type:',

        content,
      )

      return null
  }
}

export default LessonRenderer
