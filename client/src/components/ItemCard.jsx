import { getImageSrc } from "../api";

function ItemCard({ item, onMatch, onDetails }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        {item.imageUrl ? <img src={getImageSrc(item.imageUrl)} alt={item.title} className="h-14 w-14 rounded-xl object-cover" /> : <span className="text-3xl" aria-hidden="true">{item.icon}</span>}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.type === "Lost" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{item.type}</span>
      </div>
      <button onClick={() => onDetails?.(item)} className="text-left font-bold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-400">{item.title}</button>
      <p className="mt-1 text-sm text-slate-500">{item.location} · {item.when}</p>
      <p className="mt-4 text-sm text-slate-600">{item.description}</p>
      {onMatch && <button onClick={() => onMatch(item)} className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900">Find possible matches →</button>}
      {onDetails && <button onClick={() => onDetails(item)} className="ml-4 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">Details</button>}
    </article>
  );
}

export default ItemCard;
