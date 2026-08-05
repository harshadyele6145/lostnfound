export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white/80 px-6 py-8 text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
