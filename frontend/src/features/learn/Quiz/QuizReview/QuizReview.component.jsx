import { useState } from "react";

import Card from "../../../../shared/Card/Card.component";
import ProgressBar from "../../../../shared/ProgressBar/ProgressBar.component";
import Button from "../../../../shared/Button/Button.component";
import QuizComponent from "../Quiz.component";

export default function QuizReview({ attempts, onDone, rightAnswerIcon, wrongAnswerIcon }) {
  const reviewedQuestions = attempts.flatMap((attempt) =>
    attempt.questions.map((question) => ({
      question,
      selectedChoiceIds: attempt.answers[question.id] ?? [],
    })),
  );

  const [reviewIndex, setReviewIndex] = useState(0);
  const currentReview = reviewedQuestions[reviewIndex];

  if (!currentReview) {
    return null;
  }

  const { question, selectedChoiceIds } = currentReview;

  const isCorrect =
    selectedChoiceIds.length === question.correctChoiceIds.length &&
    selectedChoiceIds.every((id) => question.correctChoiceIds.includes(id));

  const reviewAnswer = {
    isCorrect,
    explanation: question.explanation,
    selectedChoiceIds,
    correctChoiceIds: question.correctChoiceIds,
  };

  const isFirstQuestion = reviewIndex === 0;
  const isLastQuestion = reviewIndex === reviewedQuestions.length - 1;

  return (
    <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
      <Card variant="quiz" className="px-7 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-6">
        <ProgressBar
          variant="illustrated"
          illustration="quiz"
          value={((reviewIndex + 1) / reviewedQuestions.length) * 100}
          label="Review progress"
          imageAlt="Review progress"
          imageWrapperClassName="mx-auto max-w-md"
          imageClassName="mx-auto w-full max-w-md"
        />

        <QuizComponent
          question={question}
          questionNumber={reviewIndex + 1}
          totalQuestions={reviewedQuestions.length}
          selectedChoiceIds={selectedChoiceIds}
          reviewAnswer={reviewAnswer}
          onChange={() => {}}
          rightAnswerIcon={rightAnswerIcon}
          wrongAnswerIcon={wrongAnswerIcon}
          reviewMode={true}
        />

        <div className="mt-8 flex justify-between gap-4 border-t border-primary/10 pt-6">
          <Button
            variant="quizSecondary"
            disabled={isFirstQuestion}
            onClick={() => setReviewIndex((current) => current - 1)}
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button variant="quiz" onClick={onDone}>
              Back to results
            </Button>
          ) : (
            <Button variant="quiz" onClick={() => setReviewIndex((current) => current + 1)}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
}
