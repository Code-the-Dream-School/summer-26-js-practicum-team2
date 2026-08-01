import { useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import { SkeletonLine, SkeletonRectangle } from '../components/ui/Skeleton.jsx'
import Toast from '../components/ui/Toast.jsx'

function HomePage() {
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

  return (
    <section className="space-y-6">
      {/* Page introduction */}
      <p className="text-small font-semibold uppercase tracking-wide text-primary">
        Financial education platform
      </p>

      <h1 className="text-h1 font-bold tracking-tight text-heading">Financial Literacy</h1>

      <p className="max-w-2xl leading-normal text-foreground">
        Learn how to manage money, create a budget, build savings, and make informed financial
        decisions.
      </p>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
      >
        Start learning
      </button>

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
          <button
            type="button"
            onClick={() => showToast('Your progress was saved.', 'success')}
            className="min-h-11 rounded-md border border-primary px-4 py-2 font-semibold text-heading hover:bg-surface-inset"
          >
            Preview save confirmation
          </button>

          <button
            type="button"
            onClick={() => showToast('Badge earned: Budgeting Basics!', 'badge')}
            className="min-h-11 rounded-md border border-primary-alt px-4 py-2 font-semibold text-heading hover:bg-surface-raised"
          >
            Preview badge earned
          </button>
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

          <div
            aria-label="Loading lesson preview"
            aria-busy="true"
            className="space-y-4 rounded-lg border border-neutral-200 bg-surface-raised p-6"
          >
            <SkeletonRectangle height={144} />
            <SkeletonLine width="45%" />
            <SkeletonLine />
            <SkeletonLine width="80%" />
          </div>
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
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="min-h-11 rounded-md border border-neutral-300 px-4 py-2 font-semibold text-heading hover:bg-surface-inset"
            >
              Not now
            </button>

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

export default HomePage
