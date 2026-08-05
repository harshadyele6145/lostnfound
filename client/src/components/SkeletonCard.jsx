export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 flex gap-2">
        <span className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        <span className="h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
