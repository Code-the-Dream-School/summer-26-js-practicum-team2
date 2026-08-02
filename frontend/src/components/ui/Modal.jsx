import { useEffect, useId, useRef } from 'react'

export default function Modal({
  children,
  isOpen,
  onClose,
  title,
  description,
  footer,
  closeOnBackdrop = true,
  showCloseButton = true,
  className = '',
}) {
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  const titleId = useId()
  const descriptionId = useId()

  // Open or close the dialog when isOpen changes
  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (isOpen && !dialog.open) {
      previousFocusRef.current = document.activeElement
      dialog.showModal()

      const focusTarget = dialog.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus()
      }
    }

    if (!isOpen && dialog.open) {
      dialog.close()

      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  // Handle pressing Escape
  const handleCancel = (event) => {
    event.preventDefault()
    onClose()
  }

  // Close the modal when clicking the backdrop
  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key !== 'Tab') return

    const dialog = dialogRef.current
    if (!dialog) return

    const focusableElements = Array.from(
      dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled'))

    if (focusableElements.length === 0) return

    const first = focusableElements[0]
    const last = focusableElements[focusableElements.length - 1]

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
  }

  return (
    // Native HTML <dialog> element used for the modal
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className={`fixed inset-0 z-50 m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-neutral-200 bg-surface-app p-0 text-foreground shadow-lg backdrop:bg-neutral-800/60 ${className}`}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
        <div>
          <h2 id={titleId} className="font-heading text-h4 font-bold text-heading">
            {title}
          </h2>

          {description && (
            <p id={descriptionId} className="mt-1 text-small text-neutral-600">
              {description}
            </p>
          )}
        </div>

        {showCloseButton && (
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="h-11 w-11 shrink-0 rounded-md text-2xl text-heading transition-colors hover:bg-surface-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            ×
          </button>
        )}
      </header>

      {/* Main content */}
      <div className="px-6 py-5">{children}</div>

      {/* Optional Footer */}
      {footer && (
        <footer className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 bg-surface-raised px-6 py-4">
          {footer}
        </footer>
      )}
    </dialog>
  )
}
