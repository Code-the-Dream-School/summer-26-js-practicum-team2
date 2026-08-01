import Button from '../components/ui/Button.jsx'

function DevComponentsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Dev Components
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Button States</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Submit</Button>
      </div>

      <p className="text-sm text-slate-600">
        Use Tab to verify the visible focus ring on interactive buttons.
      </p>
    </section>
  )
}

export default DevComponentsPage
