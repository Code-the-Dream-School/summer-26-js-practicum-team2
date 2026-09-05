// function UnorderedList({ content }) {
//   return (
//     <ul className="space-y-3">
//       {content.items.map((item) => (
//         <li key={item} className="flex items-start gap-3">
//           <span className="mt-2 h-2 w-2 rounded-full bg-primary" />

//           <span className="text-lg text-slate-700">{item}</span>
//         </li>
//       ))}
//     </ul>
//   )
// }

// export default UnorderedList

function UnorderedList({ content }) {
  return (
    <div className="rounded-xl bg-slate-50 p-6">
      <ul className="space-y-3">
        {content.items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-primary" />

            <span className="text-lg text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UnorderedList;
