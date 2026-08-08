import React from "react";

function ItemCard({ item, onClaim }) {
  const isFound = item.type?.toLowerCase() === "found";

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-3xl">{item.icon || "📦"}</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isFound
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {item.type}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          📍 {item.location} · 🕒 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.when || "Recently"}
        </p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {item.description}
        </p>
      </div>

      {isFound && onClaim && (
        <button
          onClick={onClaim}
          className="mt-6 w-full rounded-2xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Claim This Item
        </button>
      )}
    </div>
  );
}

export default ItemCard;