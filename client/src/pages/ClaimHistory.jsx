import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";

function ClaimHistory() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/items/claims/mine");
        setClaims(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your claim history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <p className="font-semibold text-blue-600">CLAIM HISTORY</p>
      <h1 className="mt-2 text-3xl font-bold">Your submitted claims</h1>
      <p className="mt-2 text-slate-600">Review claims you’ve sent and see whether they were approved or rejected.</p>

      {loading && (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <LoadingSpinner label="Loading claim history" />
            </div>
          ))}
        </div>
      )}
      {error && <div className="mt-8 rounded-2xl bg-rose-50 p-5 text-rose-700 ring-1 ring-rose-100">{error}</div>}

      {!loading && !error && (
        <>
          {claims.length ? (
            <div className="mt-8 space-y-4">
              {claims.map((claim) => (
                <article key={claim.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{claim.item?.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">{claim.item?.location} · {claim.item?.category}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{claim.item?.type}</span>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${claim.item?.status === "OPEN" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                          {claim.item?.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${claim.status === "PENDING" ? "bg-amber-50 text-amber-700" : claim.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {claim.status.toLowerCase()}
                    </span>
                  </div>

                  <p className="mt-4 text-slate-600 dark:text-slate-300">“{claim.message}”</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <span>Claim sent on {new Date(claim.createdAt).toLocaleDateString()}</span>
                    <Link to="/dashboard" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Browse reports</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <p className="text-slate-700 dark:text-slate-300">You haven’t submitted any claims yet.</p>
              <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Browse reports</Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ClaimHistory;
