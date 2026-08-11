import { Link, Navigate } from 'react-router'
import dabbingBeaverImg from '../assets/dabbingBeaver.svg'
import abigailImg from '../assets/abigail.svg'
import ramonaImg from '../assets/ramona.svg'
import { ROUTES } from '../app/router/routes.js'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import useAuth from '../hooks/useAuth.js'

function HomePage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* COMPONENT: Hero Section */}
      <section
        className="flex flex-col items-center justify-between py-12 md:py-3 lg:flex-row"
        aria-label="Introduction"
      >
        <div
          className="flex flex-col space-y-5
           lg:max-w-x1"
        >
          <h1 className="text-h1 font-bold tracking-tight text-heading">
            Master money in five minutes a day.
          </h1>
          <p className="max-w-2xl leading-normal text-foreground">
            Bite-sized lessons on budgeting, saving, and credit — built for students and new grads
            starting out on their own.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              as={Link}
              to="/register"
              id="primary-cta"
              variant="primary"
              className="px-6 py-2.5"
            >
              Start learning
            </Button>
            <Button as={Link} to="/lesson-preview" variant="secondary" className="px-6 py-2.5">
              See a sample lesson
            </Button>
          </div>
        </div>

        <div className="w-full max-w-md md:py-3 lg:max-w-xl mt-8">
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
          <Card className="flex flex-col items-center text-center p-6">
            <div className="mb-4 text-3xl" aria-hidden="true">
              ⚡
            </div>
            <h3 className="mb-2 text-xl font-semibold text-heading">No Jargon</h3>
            <p className="leading-normal text-foreground">
              Learn budgeting basics without the finance jargon.
            </p>
          </Card>
          <Card className="flex flex-col items-center text-center p-6">
            <div className="mb-4 text-3xl" aria-hidden="true">
              📱
            </div>
            <h3 className="mb-2 text-xl font-semibold text-heading">Gamified Progress</h3>
            <p className="leading-normal text-foreground">
              Track streaks and earn badges as you progress.
            </p>
          </Card>
          <Card className="flex flex-col items-center text-center p-6">
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
          <Card className="relative flex flex-col items-center text-center p-6">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
              1
            </span>
            <h3 className="mb-2 mt-2 text-xl font-semibold text-heading">Pick a Topic</h3>
            <p className="leading-normal text-foreground">
              Choose from modules covering Credit Cards, Emergency Funds, or Student Loans.
            </p>
          </Card>
          <Card className="relative flex flex-col items-center text-center p-6">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
              2
            </span>
            <h3 className="mb-2 mt-2 text-xl font-semibold text-heading">5-Min Daily Lesson</h3>
            <p className="leading-normal text-foreground">
              Read interactive, simplified concepts designed to fit straight into a busy schedule.
            </p>
          </Card>
          <Card className="relative flex flex-col items-center text-center p-6">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
              3
            </span>
            <h3 className="mb-2 mt-2 text-xl font-semibold text-heading">Test Your Knowledge</h3>
            <p className="leading-normal text-foreground">
              Complete quick summary checkpoints to solidify your learning and lock in streaks.
            </p>
          </Card>
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
    </main>
  )
}

export default HomePage
