export default function Card({ children, className = "", ...props }) {
  return (
    <div
      {...props}
      className={["rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
