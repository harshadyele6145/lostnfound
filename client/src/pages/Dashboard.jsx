import { useEffect, useMemo, useState } from "react";
import ItemCard from "../components/ItemCard";
import ItemModal from "../components/ItemModal";
import ClaimModal from "../components/ClaimModal";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonCard from "../components/SkeletonCard";
import { useToast } from "../components/ToastProvider";
import api from "../api";
import demoItems from "../data/demoItems";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [matches, setMatches] = useState(null);
  const [selected, setSelected] = useState(null);
  const [claimMatch, setClaimMatch] = useState(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get("/items");
        setItems(
          data.map((item) => ({
            ...item,
            type: item.type[0].toUpperCase() + item.type.slice(1),
            when: new Date(item.createdAt).toLocaleDateString(),
            icon: iconFor(item.category),
          }))
        );
        setDemoMode(false);
      } catch {
        setItems(demoItems);
        setDemoMode(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const categories = useMemo(() => [...new Set(items.map((item) => item.category))], [items]);

  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (!filter || item.type.toLowerCase() === filter) &&
          (!category || item.category === category) &&
          `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(query.toLowerCase())
      ),
    [items, filter, category, query]
  );

  async function findMatches(item) {
    if (demoMode) {
      const results = demoItems
        .filter((candidate) => candidate.id !== item.id && candidate.type !== item.type && (candidate.category === item.category || candidate.location === item.location))
        .map((candidate) => ({
          ...candidate,
          score: candidate.category === item.category ? 78 : 45,
          reasons: [candidate.category === item.category ? "same category" : "same location"],
        }));
      setMatches({ item, results });
      return;
    }

    try {
      const { data } = await api.get(`/items/${item.id}/matches`);
      setMatches({ item, results: data });
      setClaimError("");
      setClaimSuccess("");
    } catch {
      setMatches(null);
      setClaimError("Could not find matches.");
      setClaimSuccess("");
      addToast("Could not find match suggestions. Try again later.", "error");
    }
  }

  function openClaim(match) {
    setClaimMatch(match);
    setClaimMessage("");
    setClaimError("");
    setClaimSuccess("");
  }

  async function submitClaim() {
    if (!claimMatch) return;
    if (!claimMessage.trim()) {
      setClaimError("Please explain why this item may be yours.");
      return;
    }

    if (demoMode) {
      setClaimSuccess("Demo mode: this would send a claim once the backend is online.");
      addToast("Demo mode claim queued locally. Connect backend to submit for real.", "info");
      return;
    }

    setClaimSubmitting(true);
    setClaimError("");
    setClaimSuccess("");

    try {
      await api.post(`/items/${claimMatch.id}/claims`, { message: claimMessage });
      setClaimSuccess("Claim submitted. The report owner can review it.");
      setClaimMessage("");
    } catch (err) {
      const message = err.response?.data?.message || "Could not submit claim.";
      setClaimError(message);
      addToast(message, "error");
    } finally {
      setClaimSubmitting(false);
    }
  }

  function closeClaimModal() {
    setClaimMatch(null);
    setClaimMessage("");
    setClaimError("");
    setClaimSuccess("");
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-blue-600">COMMUNITY BOARD</p>
          <h1 className="mt-2 text-3xl font-bold dark:text-white">Browse recent reports</h1>
        </div>
        {demoMode && (
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800">Demo mode · backend offline</span>
        )}
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items, locations, or descriptions…"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All categories</option>
          {categories.map((entry) => (
            <option key={entry}>{entry}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {[["", "All"], ["lost", "Lost"], ["found", "Found"]].map(([value, label]) => (
            <button
              key={label}
              onClick={() => setFilter(value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${filter === value ? "bg-blue-600 text-white" : "bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">
            {visibleItems.length} report{visibleItems.length !== 1 ? "s" : ""} found
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.length ? (
              visibleItems.map((item) => (
                <ItemCard key={item.id} item={item} onMatch={findMatches} onDetails={setSelected} />
              ))
            ) : (
              <p className="text-slate-500">No reports match your filters.</p>
            )}
          </div>
        </>
      )}

      {matches && (
        <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">AI MATCH SUGGESTIONS</p>
              <h2 className="mt-1 text-xl font-bold dark:text-white">Possible matches for {matches.item.title}</h2>
            </div>
            <button onClick={() => setMatches(null)} className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Close
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {matches.results.length ? (
              matches.results.map((match) => (
                <div key={match.id} className="rounded-xl bg-white p-4 dark:bg-slate-900">
                  <div className="flex justify-between gap-3">
                    <p className="font-bold dark:text-white">{match.title}</p>
                    <span className="font-bold text-blue-700">{match.score}% match</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{match.location} · {match.reasons.join(" · ")}</p>
                  <button onClick={() => openClaim(match)} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Claim this item
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-600 dark:text-slate-300">No strong matches yet. New reports will be compared automatically.</p>
            )}
          </div>
        </div>
      )}

      <ItemModal item={selected} onClose={() => setSelected(null)} onMatch={findMatches} />
      <ClaimModal
        open={Boolean(claimMatch)}
        match={claimMatch}
        message={claimMessage}
        onChange={setClaimMessage}
        onSubmit={submitClaim}
        onClose={closeClaimModal}
        error={claimError}
        success={claimSuccess}
        submitting={claimSubmitting}
        demoMode={demoMode}
      />
    </section>
  );
}

function iconFor(category) {
  const value = category.toLowerCase();
  if (value.includes("electronic")) return "💻";
  if (value.includes("card")) return "💳";
  if (value.includes("bag")) return "🎒";
  if (value.includes("key")) return "🔑";
  return "📦";
}

export default Dashboard;
