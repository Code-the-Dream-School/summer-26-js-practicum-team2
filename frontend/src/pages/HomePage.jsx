import { Link } from 'react-router'
import dabbingBeaverImg from '../assets/dabbingBeaver.svg'
import abigailImg from '../assets/abigail.svg'
import ramonaImg from '../assets/ramona.svg'

function HomePage() {
  return (
    <>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* COMPONENT: Hero Section */}
        <section
          className="flex flex-col items-center justify-between py-12 md:py-20 lg:flex-row"
          aria-label="Introduction"
        >
          <div className="flex flex-col space-y-6
           lg:max-w-xl">
            <h1 className="text-h1 font-bold tracking-tight text-heading">
              Master money in five minutes a day.
            </h1>
            <p className="max-w-2xl leading-normal text-foreground">
              Bite-sized lessons on budgeting, saving, and credit — built for students and new grads
              starting out on their own.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                id="primary-cta"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2.5 font-semibold text-on-primary hover:bg-primary-hover transition-colors"
              >
                Start learning
              </Link>
              <Link
                to="/lesson-preview"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-neutral-300 bg-surface-input px-6 py-2.5 font-semibold text-foreground hover:bg-surface-raised transition-colors"
              >
                See a sample lesson
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-xl">
              <img
                src={dabbingBeaverImg}
                alt="An approachable beaver mascot greeting you"
                className="mx-5 h-auto object-contain inline-block w-1/5"
                loading="eager"
              />

              <img
                src={abigailImg}
                alt="Female avatar in a blue sweater greeting you"
                className="mx-5 h-auto object-contain inline-block w-1/5"
                loading="eager"
              />

              <img
                src={ramonaImg}
                alt="Female avatar in a purple sweater greeting you"
                className="mx-5 h-auto object-contain inline-block w-1/5"
                loading="eager"
              />
          </div>
        </section>

        {/* COMPONENT: Benefits Section */}
        <section id="benefits" className="py-12 md:py-20" aria-labelledby="benefits-title">
          <div className="text-center mb-12">
            <h2 id="benefits-title" className="text-h2 font-bold tracking-tight text-heading">
              Why Choose Our App
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <article className="flex flex-col items-center text-center p-6 bg-surface-raised rounded-xl shadow-sm border border-neutral-200">
              <div className="text-3xl mb-4" aria-hidden="true">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-heading mb-2">No Jargon</h3>
              <p className="text-foreground leading-normal">
                Learn budgeting basics without the finance jargon.
              </p>
            </article>
            <article className="flex flex-col items-center text-center p-6 bg-surface-raised rounded-xl shadow-sm border border-neutral-200">
              <div className="text-3xl mb-4" aria-hidden="true">
                📱
              </div>
              <h3 className="text-xl font-semibold text-heading mb-2">Gamified Progress</h3>
              <p className="text-foreground leading-normal">
                Track streaks and earn badges as you progress.
              </p>
            </article>
            <article className="flex flex-col items-center text-center p-6 bg-surface-raised rounded-xl shadow-sm border border-neutral-200">
              <div className="text-3xl mb-4" aria-hidden="true">
                🔒
              </div>
              <h3 className="text-xl font-semibold text-heading mb-2">100% Free</h3>
              <p className="text-foreground leading-normal">
                Free forever — no bank account required.
              </p>
            </article>
          </div>
        </section>

        {/* REQUIRED CHECKLIST COMPONENT: How-It-Works Section */}
        <section
          id="how-it-works"
          className="py-12 md:py-20 border-t border-neutral-200"
          aria-labelledby="how-title"
        >
          <div className="text-center mb-12">
            <h2 id="how-title" className="text-h2 font-bold tracking-tight text-heading">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-surface-input rounded-xl shadow-sm border border-neutral-200 relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-on-primary text-sm">
                1
              </span>
              <h3 className="text-xl font-semibold text-heading mb-2 mt-2">Pick a Topic</h3>
              <p className="text-foreground leading-normal">
                Choose from modules covering Credit Cards, Emergency Funds, or Student Loans.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-surface-input rounded-xl shadow-sm border border-neutral-200 relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-on-primary text-sm">
                2
              </span>
              <h3 className="text-xl font-semibold text-heading mb-2 mt-2">5-Min Daily Lesson</h3>
              <p className="text-foreground leading-normal">
                Read interactive, simplified concepts designed to fit straight into a busy schedule.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-surface-input rounded-xl shadow-sm border border-neutral-200 relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-on-primary text-sm">
                3
              </span>
              <h3 className="text-xl font-semibold text-heading mb-2 mt-2">Test Your Knowledge</h3>
              <p className="text-foreground leading-normal">
                Complete quick summary checkpoints to solidify your learning and lock in streaks.
              </p>
            </div>
          </div>
        </section>

        {/* COMPONENT: FAQ Section */}
        <section
          id="faq"
          className="py-12 md:py-20 border-t border-neutral-200"
          aria-labelledby="faq-title"
        >
          <div className="max-w-3xl mx-auto">
            <h2
              id="faq-title"
              className="text-h2 font-bold tracking-tight text-heading text-center mb-12"
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="p-6 bg-surface-raised rounded-lg border border-neutral-200">
                <h4 className="text-lg font-semibold text-heading mb-2">1. Is it free?</h4>
                <p className="text-foreground leading-normal">
                  Yes — every lesson, quiz, and badge is free. There's no paid tier and no ads. We
                  built this so anyone starting out can learn money basics without a paywall.
                </p>
              </div>
              <div className="p-6 bg-surface-raised rounded-lg border border-neutral-200">
                <h4 className="text-lg font-semibold text-heading mb-2">
                  2. How long does it take?
                </h4>
                <p className="text-foreground leading-normal">
                  Most lessons take three to five minutes, and a full topic runs about a week at one
                  lesson a day. You can go faster or slower — your progress saves automatically.
                </p>
              </div>
              <div className="p-6 bg-surface-raised rounded-lg border border-neutral-200">
                <h4 className="text-lg font-semibold text-heading mb-2">3. Who is it for?</h4>
                <p className="text-foreground leading-normal">
                  It's designed for first-time earners: students opening their first checking
                  account and recent grads getting their first paycheck. No prior finance knowledge
                  is assumed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default HomePage
