import { useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import { SkeletonLine, SkeletonRectangle } from '../components/ui/Skeleton.jsx'
import Toast from '../components/ui/Toast.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import Textarea from '../components/ui/Textarea.jsx'

function DevComponentsPage() {
  const [emailValue, setEmailValue] = useState('not-an-email')
  const [emailError, setEmailError] = useState('Please enter a valid email address.')
  const [notesValue, setNotesValue] = useState('')
  const [notesError, setNotesError] = useState('Please enter at least 10 characters.')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
    variant: 'default',
  })

  const showToast = (message, variant = 'default') => {
    setToast({
      isOpen: true,
      message,
      variant,
    })
  }

  const closeToast = () => {
    setToast({
      ...toast,
      isOpen: false,
    })
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Component States</h1>
      </header>

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
        <h2 className="text-lg font-semibold text-slate-900">Inputs</h2>

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
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Textareas</h2>

        <div className="grid gap-4 md:grid-cols-2">
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

      <p className="text-sm text-slate-600">
        Use Tab to verify the visible focus ring on buttons and inputs.
      </p>

      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-semibold text-slate-900">Cards</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Default
            </p>
            <h3 className="mt-1 font-heading text-h4 font-bold text-heading">Card title</h3>
            <p className="mt-2 text-small text-neutral-600">
              Container primitive with default state.
            </p>
          </Card>

          <Card interactive>
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Interactive
            </p>
            <h3 className="mt-1 font-heading text-h4 font-bold text-heading">Hover me</h3>
            <p className="mt-2 text-small text-neutral-600">
              Adds hover affordance for clickable containers.
            </p>
          </Card>

          <Card selected>
            <p className="text-caption font-semibold uppercase tracking-wide text-primary">
              Selected
            </p>
            <h3 className="mt-1 font-heading text-h4 font-bold text-heading">Current selection</h3>
            <p className="mt-2 text-small text-neutral-600">Shows persistent selected emphasis.</p>
          </Card>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
      >
        Start learning
      </Button>

      {/* Achievement badge preview */}
      <div className="space-y-3 pt-4">
        <p className="text-small font-semibold text-heading">Course badge preview</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Badge
            title="Budgeting Basics"
            course="Personal Finance · Cash Flow"
            earnedDate="July 30, 2026"
          />
          <Badge title="Savings Starter" course="Personal Finance · Savings" earned={false} />
        </div>
      </div>

      {/* Toast preview */}
      <div className="space-y-3 pt-2">
        <p className="text-small font-semibold text-heading">Notification preview</p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => showToast('Your progress was saved.', 'success')}
            className="min-h-11 rounded-md border border-primary px-4 py-2 font-semibold text-heading hover:bg-surface-inset"
          >
            Preview save confirmation
          </Button>

          <Button
            type="button"
            onClick={() => showToast('Badge earned: Budgeting Basics!', 'badge')}
            className="min-h-11 rounded-md border border-primary-alt px-4 py-2 font-semibold text-heading hover:bg-surface-raised"
          >
            Preview badge earned
          </Button>
        </div>
      </div>

      {/* Empty state and loading preview */}
      <div className="space-y-3 pt-2">
        <p className="text-small font-semibold text-heading">Placeholder preview</p>

        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState
            icon={<span aria-hidden="true">📚</span>}
            title="No lessons in progress"
            message="Choose a lesson to start building your financial skills."
            action={
              <a
                href="/lessons"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 font-semibold text-on-primary hover:bg-primary-hover"
              >
                Browse lessons
              </a>
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

      {/* Welcome modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Welcome to Sprout"
        description="Build practical money skills one lesson at a time."
        footer={
          <>
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="min-h-11 rounded-md border border-neutral-300 px-4 py-2 font-semibold text-heading hover:bg-surface-inset"
            >
              Not now
            </Button>

            <a
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 font-semibold text-on-primary hover:bg-primary-hover"
            >
              Create an account
            </a>
          </>
        }
      >
        <p className="leading-normal">
          Create a free account to save your progress as you learn about budgeting, cash flow, and
          saving.
        </p>
      </Modal>

      {/* Toast notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        variant={toast.variant}
        duration={4000}
        onClose={closeToast}
      />
    </section>
  )
}

export default DevComponentsPage
