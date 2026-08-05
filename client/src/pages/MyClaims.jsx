import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastProvider";

function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  async function loadClaims() {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/items/mine/claims");
      setClaims(data);
    } catch (err) {
      setError(err.response?.data?.message || "Sign in to review claims.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  async function review(id, status) {
    try {
      await api.patch(`/items/claims/${id}`, { status });
      await loadClaims();
    } catch (err) {
      const message = err.response?.data?.message || "Could not update claim.";
      setError(message);
      addToast(message, "error");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <p className="font-semibold text-blue-600">OWNER CONSOLE</p>
      <h1 className="mt-2 text-3xl font-bold">Claim requests</h1>
      <p className="mt-2 text-slate-600">Review proof carefully before sharing a handover location.</p>

      {loading && (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <LoadingSpinner label="Loading claim" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl bg-rose-50 p-5 text-rose-700 ring-1 ring-rose-100">
          <p>{error}</p>
          <Link to="/login" className="mt-3 inline-block font-semibold underline">
            Sign in
          </Link>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-7 space-y-4">
          {claims.length ? (
            claims.map((claim) => (
              <article key={claim.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">{claim.item?.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">Claimed by {claim.claimant?.name} · {claim.claimant?.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{claim.item?.type}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{claim.item?.category}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${claim.status === "PENDING" ? "bg-amber-50 text-amber-700" : claim.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {claim.status.toLowerCase()}
                  </span>
                </div>

                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-200">“{claim.message}”</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                  <span>Claim submitted on {new Date(claim.createdAt).toLocaleDateString()}</span>
                  {claim.status === "PENDING" && (
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => review(claim.id, "approved")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                        Approve
                      </button>
                      <button onClick={() => review(claim.id, "rejected")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <p className="text-slate-600 dark:text-slate-300">No one has claimed your reports yet.</p>
              <Link to="/dashboard" className="mt-4 inline-block font-semibold text-blue-700">
                Browse reports →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default MyClaims;
