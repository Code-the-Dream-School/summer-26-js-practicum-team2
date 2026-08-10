import Card from '../ui/Card.jsx'

// QuizComponent renders a quiz question with multiple choice answers.
function QuizComponent({
  question,
  questionNumber,
  totalQuestions,
  selectedChoiceIds = [],
  reviewAnswer,
  onChange,
  rightAnswerIcon,
  wrongAnswerIcon,
}) {
  // Determine if the question allows multiple selections based on its type.
  const allowsMultiple = question?.type === 'multiSelect'

  // Handle the selection of a choice. If multiple selections are not allowed, it will replace the current selection. If multiple selections are allowed, it will toggle the selected state of the choice.
  function handleChoice(choiceId) {
    if (!allowsMultiple) {
      // If the question does not allow multiple selections, set the selected choice to the clicked choice.
      onChange([choiceId])
      return
    }

    if (selectedChoiceIds.includes(choiceId)) {
      // If the choice is already selected and multiple selections are allowed, remove it from the selected choices.
      onChange(selectedChoiceIds.filter((selectedChoiceId) => selectedChoiceId !== choiceId))
      return
    }
    // If the choice is not selected and multiple selections are allowed, add it to the selected choices.
    onChange([...selectedChoiceIds, choiceId])
  }

  if (!question) {
    // If there is no question provided, return null to render nothing.
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      <p className="text-small font-semibold text-primary">
        {/* Display the current question number and total number of questions. */}
        Question {questionNumber} of {totalQuestions}
      </p>
      <h2 className="font-heading text-h3 font-bold text-heading">{question.prompt}</h2>

      <div className="space-y-3">
        {/* Render each choice as a selectable card. */}
        {question.choices.map((choice) => {
          // Determine if the choice is selected and if it is the correct choice.
          const isSelected = selectedChoiceIds.includes(choice.id)
          const isCorrectChoice = question.correctChoiceIds.includes(choice.id)
          // Determine the variant of the card based on whether the answer is being reviewed and if the choice is selected.
          const variant =
            reviewAnswer && isSelected ? (reviewAnswer.isCorrect ? 'success' : 'danger') : 'choice'
            // Determine the icon to display based on whether the answer is being reviewed and if the choice is selected.
          const selectedIcon = reviewAnswer
            ? isSelected && reviewAnswer.isCorrect
              ? rightAnswerIcon
              : isSelected
                ? wrongAnswerIcon
                : null
            : null

          return (
            <div key={choice.id} className="relative">
              {/* Display the selected icon if available. */}
              {selectedIcon ? (
                <img
                  src={selectedIcon}
                  alt={reviewAnswer.isCorrect ? 'Correct answer' : 'Incorrect answer'}
                  className="pointer-events-none absolute -left-6 top-1/2 h-10 w-10 -translate-y-1/2 sm:-left-7 sm:h-12 sm:w-12"
                />
              ) : null}
              {/* Render the choice card. */}
              <Card
                variant={variant}
                interactive={!reviewAnswer}
                selected={!reviewAnswer && isSelected}
                onClick={reviewAnswer ? undefined : () => handleChoice(choice.id)}
                role={allowsMultiple ? 'checkbox' : 'radio'}
                aria-checked={isSelected}
                className="px-4 py-3 text-left text-base"
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 font-semibold text-heading">
                    {choice.id.toUpperCase()}.
                  </span>
                  <span>{choice.label}</span>
                  {/* Display the correctness indicator if reviewing the answer and the choice is correct. */}
                  {reviewAnswer && isCorrectChoice ? (
                    <span className="ml-auto text-sm font-semibold text-success">Correct</span>
                  ) : null}
                </div>
              </Card>
            </div>
          )
        })}
      </div>
        {/* Render the review answer section if available. */}
      {reviewAnswer ? (
        <div className="space-y-3">
          <p className="font-semibold text-heading">
            {reviewAnswer.isCorrect ? 'Correct!' : 'Try again!'}
          </p>
          <p className="text-foreground">Explanation: {reviewAnswer.explanation}</p>
        </div>
      ) : null}
    </div>
  )
}

export default QuizComponent
