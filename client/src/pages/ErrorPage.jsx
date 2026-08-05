import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Oops</p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Something went wrong</h1>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">We couldn’t load this page. Try refreshing or return home and try again.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/" className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Go home</Link>
        <button onClick={() => window.location.reload()} className="inline-flex rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Reload page</button>
      </div>
    </main>
  );
}
