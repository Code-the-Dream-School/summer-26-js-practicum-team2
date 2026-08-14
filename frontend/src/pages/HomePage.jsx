import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { ROUTES, SAMPLE_LESSON_LINK } from "../app/router/routes.js";
import Button from "../shared/Button/Button.component.jsx";
import Card from "../shared/Card/Card.component.jsx";
import dabbingBeaverImg from "../assets/dabbingBeaver.svg";
import abigailImg from "../assets/abigail.svg";
import ramonaImg from "../assets/ramona.svg";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <section
        className="flex flex-col items-center justify-between py-12 md:py-3 lg:flex-row"
        aria-label="Introduction"
      >
        <div className="flex max-w-2xl flex-col space-y-5">
          <h1 className="font-heading text-h1 font-bold tracking-tight text-heading">
            Master money in five minutes a day.
          </h1>
          <p className="max-w-2xl text-body leading-normal text-foreground">
            Bite-sized lessons on budgeting, saving, and credit — built for students and new grads
            starting out on their own.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              as={Link}
              to={isAuthenticated ? ROUTES.LEARN : ROUTES.REGISTER}
              id="primary-cta"
              variant="primary"
              className="px-6 py-2.5"
            >
              {isAuthenticated ? "Start learning" : "Register to start learning"}
            </Button>
            <Button
              as={Link}
              to={isAuthenticated ? ROUTES.LAST_LESSON : SAMPLE_LESSON_LINK}
              variant="secondary"
              className="px-6 py-2.5"
            >
              {isAuthenticated ? "Jump Back in" : "See a sample lesson"}
            </Button>
          </div>
        </div>

        <div className="mt-8 flex w-full max-w-md items-center justify-center gap-4 md:py-3 lg:max-w-xl">
          <img
            src={dabbingBeaverImg}
            alt="An approachable beaver mascot greeting you"
            className="h-auto w-1/5 object-contain"
            loading="eager"
          />
          <img
            src={abigailImg}
            alt="Female avatar in a blue sweater greeting you"
            className="h-auto w-1/5 object-contain"
            loading="eager"
          />
          <img
            src={ramonaImg}
            alt="Female avatar in a purple sweater greeting you"
            className="h-auto w-1/5 object-contain"
            loading="eager"
          />
        </div>
      </section>

      <section id="benefits" className="py-12 md:py-20" aria-labelledby="benefits-title">
        <div className="mb-12 text-center">
          <h2
            id="benefits-title"
            className="font-heading text-h2 font-bold tracking-tight text-heading"
          >
            Why Choose Our App
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 text-3xl" aria-hidden="true">
              ⚡
            </div>
            <h3 className="mb-2 text-xl font-semibold text-heading">No Jargon</h3>
            <p className="leading-normal text-foreground">
              Learn budgeting basics without the finance jargon.
            </p>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 text-3xl" aria-hidden="true">
              📱
            </div>
            <h3 className="mb-2 text-xl font-semibold text-heading">Gamified Progress</h3>
            <p className="leading-normal text-foreground">
              Track streaks and earn badges as you progress.
            </p>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 text-3xl" aria-hidden="true">
              🔒
            </div>
            <h3 className="mb-2 text-xl font-semibold text-heading">100% Free</h3>
            <p className="leading-normal text-foreground">
              Free forever — no bank account required.
            </p>
          </Card>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-neutral-200 py-12 md:py-20"
        aria-labelledby="how-title"
      >
        <div className="mb-12 text-center">
          <h2 id="how-title" className="font-heading text-h2 font-bold tracking-tight text-heading">
            How It Works
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              step: 1,
              title: "Pick a Topic",
              body: "Choose from modules covering Credit Cards, Emergency Funds, or Student Loans.",
            },
            {
              step: 2,
              title: "5-Min Daily Lesson",
              body: "Read interactive, simplified concepts designed to fit straight into a busy schedule.",
            },
            {
              step: 3,
              title: "Test Your Knowledge",
              body: "Complete quick summary checkpoints to solidify your learning and lock in streaks.",
            },
          ].map((s) => (
            <Card key={s.step} className="relative flex flex-col items-center p-6 text-center">
              <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                {s.step}
              </span>
              <h3 className="mb-2 mt-2 text-xl font-semibold text-heading">{s.title}</h3>
              <p className="leading-normal text-foreground">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="border-t border-neutral-200 py-12 md:py-20"
        aria-labelledby="faq-title"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="faq-title"
            className="mb-12 text-center font-heading text-h2 font-bold tracking-tight text-heading"
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="mb-2 text-lg font-semibold text-heading">1. Is it free?</h4>
              <p className="leading-normal text-foreground">
                Yes — every lesson, quiz, and badge is free. There's no paid tier and no ads. We
                built this so anyone starting out can learn money basics without a paywall.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2 text-lg font-semibold text-heading">2. How long does it take?</h4>
              <p className="leading-normal text-foreground">
                Most lessons take three to five minutes, and a full topic runs about a week at one
                lesson a day. You can go faster or slower — your progress saves automatically.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2 text-lg font-semibold text-heading">3. Who is it for?</h4>
              <p className="leading-normal text-foreground">
                It's designed for first-time earners: students opening their first checking account
                and recent grads getting their first paycheck. No prior finance knowledge is
                assumed.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
