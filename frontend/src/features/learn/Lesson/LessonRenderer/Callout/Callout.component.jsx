function Callout({ content }) {
  return (
    <div className="my-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Key Takeaway
      </div>

      <p className="text-lg font-medium text-slate-800">{content.text}</p>
    </div>
  );
}

export default Callout;
