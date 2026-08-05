import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getImageSrc } from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastProvider";

function MyReports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/items/mine");
      setItems(data);
    } catch (err) {
      const message = err.response?.data?.message || "Could not load your reports.";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function updateReportStatus(item) {
    setLoading(true);
    setError("");

    try {
      const newStatus = item.status === "OPEN" ? "RESOLVED" : "OPEN";
      await api.patch(`/items/${item.id}`, { status: newStatus });
      await loadReports();
      addToast(`Report ${newStatus === "RESOLVED" ? "marked resolved" : "reopened"}.`, "success");
    } catch (err) {
      const message = err.response?.data?.message || "Could not update this report.";
      setError(message);
      addToast(message, "error");
      setLoading(false);
    }
  }

  async function deleteReport(id) {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setLoading(true);
    setError("");

    try {
      await api.delete(`/items/${id}`);
      await loadReports();
      addToast("Report deleted successfully.", "success");
    } catch (err) {
      const message = err.response?.data?.message || "Could not delete this report.";
      setError(message);
      addToast(message, "error");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <p className="font-semibold text-blue-600">OWNER DASHBOARD</p>
      <h1 className="mt-2 text-3xl font-bold">Your reports</h1>
      <p className="mt-2 text-slate-600">Track the lost or found items you’ve shared with the campus community.</p>

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <LoadingSpinner label="Loading report" />
            </div>
          ))}
        </div>
      )}
      {error && <div className="mt-8 rounded-2xl bg-rose-50 p-5 text-rose-700 ring-1 ring-rose-100">{error}</div>}

      {!loading && !error && (
        <>
          {items.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900">
                  {item.imageUrl && (
                    <img src={getImageSrc(item.imageUrl)} alt={item.title} className="h-40 w-full object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h2>
                        <p className="mt-1 text-sm text-slate-500">{item.location} · {item.date}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "OPEN" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {item.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.category}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.type}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Reported on {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link to={`/edit/${item.id}`} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                        Edit report
                      </Link>
                      <button onClick={() => updateReportStatus(item)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                        {item.status === "OPEN" ? "Mark resolved" : "Reopen"}
                      </button>
                      <button onClick={() => deleteReport(item.id)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">
                        Delete report
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <p className="text-slate-700 dark:text-slate-300">You haven’t posted any reports yet.</p>
              <Link to="/report-lost" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Report an item</Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default MyReports;
