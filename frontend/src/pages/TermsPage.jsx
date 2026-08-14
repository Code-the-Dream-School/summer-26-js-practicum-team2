import Card from "../shared/Card/Card.component.jsx";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <Card className="flex flex-col gap-4">
        <h1 className="font-heading text-h2 font-bold text-heading">
          Terms of Service
        </h1>
        <p className="text-body leading-normal text-foreground">
          Sprout is provided as-is for educational purposes as part of the Code
          the Dream JavaScript Practicum. By using Sprout you agree to the
          following:
        </p>
        <ul className="list-inside list-disc space-y-2 text-body text-foreground">
          <li>
            You will use the site only for lawful, personal, non-commercial
            learning.
          </li>
          <li>
            You will not attempt to disrupt other learners' accounts or the
            service itself.
          </li>
          <li>
            You understand that{" "}
            <strong>
              this app provides general financial education only and is not
              personalized financial, legal, tax, investment, or credit advice
            </strong>
            . Consider consulting a qualified professional before making any
            financial decisions.
          </li>
        </ul>
        <p className="text-body leading-normal text-foreground">
          We may change these terms as the app evolves. Continued use after a
          change means you accept the update.
        </p>
      </Card>
    </div>
  );
}
