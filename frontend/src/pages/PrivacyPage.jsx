import Card from "../shared/Card/Card.component.jsx";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <Card className="flex flex-col gap-4">
        <h1 className="font-heading text-h2 font-bold text-heading">
          Privacy Policy
        </h1>
        <p className="text-body leading-normal text-foreground">
          Sprout is a student project built for the Code the Dream JavaScript
          Practicum. This Privacy Policy describes what limited data we collect
          and how we use it.
        </p>
        <h2 className="font-heading text-h4 font-bold text-heading">
          What we collect
        </h2>
        <ul className="list-inside list-disc space-y-1 text-body text-foreground">
          <li>Your name, email address, and hashed password.</li>
          <li>Your lesson progress and quiz attempts.</li>
          <li>Basic session cookies required to keep you logged in.</li>
        </ul>
        <h2 className="font-heading text-h4 font-bold text-heading">
          What we don't do
        </h2>
        <ul className="list-inside list-disc space-y-1 text-body text-foreground">
          <li>We don't sell or share your data with third parties.</li>
          <li>
            We don't ask for your bank account or any financial credentials.
          </li>
          <li>We don't run third-party ad networks.</li>
        </ul>
        <p className="text-body leading-normal text-foreground">
          Questions? Open an issue on our GitHub repository and one of the
          practicum team members will get back to you.
        </p>
      </Card>
    </div>
  );
}
