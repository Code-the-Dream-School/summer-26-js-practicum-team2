export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-2 text-neutral-600" role="status">
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary"
        aria-hidden
      />
      <span className="text-small">{label}…</span>
    </div>
  );
}
