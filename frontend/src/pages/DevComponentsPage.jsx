import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

function DevComponentsPage() {
  const [emailValue, setEmailValue] = useState('not-an-email')
  const [emailError, setEmailError] = useState('Please enter a valid email address.')

  const syncEmailError = (input) => {
    setEmailError(input.validity.valid ? '' : input.validationMessage)
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

      <p className="text-sm text-slate-600">
        Use Tab to verify the visible focus ring on buttons and inputs.
      </p>
    </section>
  )
}

export default DevComponentsPage
