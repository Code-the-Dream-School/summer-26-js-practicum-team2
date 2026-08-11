import { useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import NavBar from '../components/ui/NavBar.jsx'
import Textarea from '../components/ui/Textarea.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import { SkeletonLine, SkeletonRectangle } from '../components/ui/Skeleton.jsx'
import Toast from '../components/ui/Toast.jsx'

function DevComponentsPage() {
  const [emailValue, setEmailValue] = useState('not-an-email')
  const [emailError, setEmailError] = useState('Please enter a valid email address.')
  const [notesValue, setNotesValue] = useState('')
  const [notesError, setNotesError] = useState('Please enter at least 10 characters.')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)

  const milestones = [25, 50, 75, 90]

  const syncEmailError = (input) => {
    setEmailError(input.validity.valid ? '' : input.validationMessage)
  }

  const syncNotesError = (input) => {
    setNotesError(input.validity.valid ? '' : input.validationMessage)
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Dev Components
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Shared Component Checklist</h1>
        <p className="text-small text-neutral-700">
          This page is for demonstrating the components that are available in the shared component
          library. It is not intended to be a final design or implementation of any specific page or
          feature.
        </p>
      </header>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">NavBar component</h2>
        <p className="text-small text-neutral-600">Signed out state</p>
        <NavBar signedIn={false} className="rounded-lg" />
        <p className="pt-2 text-small text-neutral-600">Signed in state (avatar + XP + streak)</p>
        <NavBar signedIn avatarLabel="A" xp={340} streak={11} className="rounded-lg" />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Buttons</h2>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Submit</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Input + Textarea</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Default" placeholder="Enter your name" />
          <Input
            label="With helper text"
            placeholder="name@example.com"
            helperText="We will only use this for account updates."
          />
          <Input
            label="Error"
            type="email"
            required
            value={emailValue}
            onChange={(event) => {
              setEmailValue(event.target.value)
              syncEmailError(event.target)
            }}
            onBlur={(event) => syncEmailError(event.target)}
            error={emailError || undefined}
            helperText="Use your primary email."
          />
          <Input
            label="Disabled"
            defaultValue="Unavailable while syncing"
            helperText="This field becomes editable later."
            disabled
          />
          <Input
            label="Focused"
            placeholder="Tab here to verify focus styles"
            helperText="Use tab key to see the focus ring."
            className="md:col-span-2"
            autoFocus
          />
          <Textarea label="Default" placeholder="Share your goals" />
          <Textarea
            label="With helper text"
            placeholder="Add context for your support request"
            helperText="Include account details only if needed."
          />
          <Textarea
            label="Error"
            required
            minLength={10}
            value={notesValue}
            onChange={(event) => {
              setNotesValue(event.target.value)
              syncNotesError(event.target)
            }}
            onBlur={(event) => syncNotesError(event.target)}
            error={notesError || undefined}
            helperText="Please provide at least 10 characters."
            placeholder="Describe the issue"
          />
          <Textarea
            label="Disabled"
            defaultValue="Unavailable while syncing"
            helperText="This field becomes editable later."
            disabled
          />
          <Textarea
            label="Focused"
            placeholder="Tab here to verify focus styles"
            helperText="Use tab key to see the focus ring."
            className="md:col-span-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Cards</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Default
            </p>
            <h3 className="mt-1 font-semibold text-heading">Card title</h3>
            <p className="mt-2 text-small text-neutral-600">
              Container primitive with default state.
            </p>
          </Card>

          <Card interactive>
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Interactive
            </p>
            <h3 className="mt-1 font-semibold text-heading">Hover me</h3>
            <p className="mt-2 text-small text-neutral-600">Adds hover affordance.</p>
          </Card>

          <Card selected>
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Selected
            </p>
            <h3 className="mt-1 font-semibold text-heading">Current selection</h3>
            <p className="mt-2 text-small text-neutral-600">Uses a prop to change styles.</p>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Progress Bars</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Lesson progress (linear)
            </p>
            {milestones.map((value) => (
              <div key={value} className="space-y-1">
                <p className="text-small text-neutral-700">Milestone: {value}%</p>
                <ProgressBar value={value} showValue label={`Milestone ${value}`} />
              </div>
            ))}
          </Card>

          <Card className="space-y-3">
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Daily goal (circular)
            </p>
            <div className="flex items-center gap-3">
              <ProgressBar
                variant="circular"
                size="sm"
                value={34}
                tone="warning"
                label="Goal warning"
              />
              <ProgressBar variant="circular" size="md" value={67} label="Goal progress" />
              <ProgressBar
                variant="circular"
                size="lg"
                value={92}
                tone="success"
                label="Goal complete"
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge mode="pill" variant="default" label="Default" />
          <Badge mode="pill" variant="success" label="Success" />
          <Badge mode="pill" variant="warning" label="Warning" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Badge
            mode="earned"
            variant="success"
            title="Budgeting Basics"
            course="Personal Finance · Cash Flow"
            earnedDate="July 30, 2026"
          />
          <Badge mode="earned" variant="default" title="Savings Starter" earned={false} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Modal / Dialog</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open modal</Button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Welcome to Sprout"
          description="This modal uses native dialog, supports Esc, focus trap, and focus return."
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Continue</Button>
            </>
          }
        >
          <p className="text-small text-neutral-700">
            Create an account to save your progress as you move through each lesson.
          </p>
          <div className="mt-4 grid gap-3">
            <Input label="Email" placeholder="you@example.com" />
            <Input type="password" label="Password" placeholder="Enter password" />
          </div>
        </Modal>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Toast / Snackbar</h2>
        <Button onClick={() => setToastOpen(true)}>Show toast</Button>
        <Toast
          isOpen={toastOpen}
          onClose={() => setToastOpen(false)}
          message="Your progress was saved."
          variant="success"
          duration={4000}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Empty State + Skeleton</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState
            icon={<span aria-hidden="true">📚</span>}
            title="No lessons in progress"
            message="Choose a lesson to start building your financial skills."
            action={
              <Button as="a" href="/lessons" variant="primary" className="px-4 py-2">
                Browse lessons
              </Button>
            }
          />

          <Card aria-label="Loading lesson preview" aria-busy="true" className="space-y-4 p-6">
            <SkeletonRectangle height={144} />
            <SkeletonLine width="45%" />
            <SkeletonLine />
            <SkeletonLine width="80%" />
          </Card>
        </div>
      </div>
    </section>
  )
}

export default DevComponentsPage
