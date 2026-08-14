function Paragraph({ content }) {
  return (
    <div className="max-w-prose text-center">
      <p className="text-lg text-center text-slate-700">{content.text}</p>
    </div>
  );
}

export default Paragraph;
