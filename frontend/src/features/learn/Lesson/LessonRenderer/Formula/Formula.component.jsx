function Formula({ content }) {
  return (
    <div className="my-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm">
      <div className="text-center text-2xl font-bold text-emerald-800">{content.text}</div>
    </div>
  );
}

export default Formula;
