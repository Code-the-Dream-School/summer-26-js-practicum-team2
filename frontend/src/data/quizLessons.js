export const QUIZ_LESSONS = {
  budgeting: {
    id: 'budgeting',
    title: 'Budgeting and Cash Flow Basics',
    lessonTitle: 'Budgeting / Cash Flow',
    introCopy: 'This quiz uses the budgeting lesson content already written for Sprout.',
    passThreshold: 0.7,
    questions: [
      {
        id: 'budget-purpose',
        type: 'true-false',
        prompt: 'The main purpose of a budget is so the bank can tell me where to spend my money.',
        choices: [
          { id: 'true', label: 'True' },
          { id: 'false', label: 'False' },
        ],
        correctChoiceIds: ['false'],
        explanation: 'The budget is for you. You control what is happening to your money.',
        difficulty: 'easy',
      },
      {
        id: 'budget-purpose-2',
        type: 'multiple-choice',
        prompt: 'What are the two main categories in a budget?',
        choices: [
          { id: 'a', label: 'Income and expenses' },
          { id: 'b', label: 'Needs and wants' },
          { id: 'c', label: 'Gross pay and net pay' },
          { id: 'd', label: 'Savings and debt' },
        ],
        correctChoiceIds: ['a'],
        explanation: 'The lesson says budgets involve two main categories: income and expenses.',
        difficulty: 'medium',
      },
      {
        id: 'cash-flow',
        type: 'multiple-choice',
        prompt: 'How do you calculate cash flow?',
        choices: [
          { id: 'a', label: 'Income - Expenses = Cash Flow' },
          { id: 'b', label: 'Expenses - Income = Cash Flow' },
          { id: 'c', label: 'Income + Expenses = Cash Flow' },
          { id: 'd', label: 'Income x Expenses = Cash Flow' },
        ],
        correctChoiceIds: ['a'],
        explanation: 'Cash flow is income minus expenses.',
        difficulty: 'medium',
      },
    ],
  },
}

export function getQuizLesson(lessonId) {
  return QUIZ_LESSONS[lessonId] ?? null
}
