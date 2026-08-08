import { useState } from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import ClaimModal from "../components/ClaimModal";

const items = [
  {
    id: "demo-1",
    icon: "🎧",
    title: "Black wireless headphones",
    type: "Found",
    category: "Electronics",
    location: "Central Library",
    when: "Today",
    description: "Found near the second-floor study area.",
  },
  {
    id: "demo-2",
    icon: "💳",
    title: "Student ID card",
    type: "Lost",
    category: "Cards & IDs",
    location: "Engineering Block",
    when: "Yesterday",
    description: "Name begins with A. Last seen outside Lab 204.",
  },
  {
    id: "demo-3",
    icon: "🔑",
    title: "Keychain with blue tag",
    type: "Found",
    category: "Keys",
    location: "Main Cafeteria",
    when: "Yesterday",
    description: "Handed in at the cafeteria counter.",
  },
];

function Home() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const handleOpenClaim = (item) => {
    setSelectedItem(item);
    setIsClaimModalOpen(true);
  };

  const handleCloseClaim = () => {
    setIsClaimModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,.9),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(79,70,229,.75),transparent_38%)]" />
        <div className="absolute -right-20 top-10 -z-10 h-72 w-72 rounded-full border border-white/15" />
        <div className="absolute -bottom-24 left-1/4 -z-10 h-80 w-80 rounded-full border border-white/10" />
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-cyan-300" /> A smarter campus lost & found
          </p>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            Lost something?<br />
            <span className="text-blue-200">Let campus help.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">
            Report lost or found items, discover likely matches, and bring belongings home—without the notice-board chaos.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/report-lost"
              className="rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 shadow-xl shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              I lost an item →
            </Link>
            <Link
              to="/report-found"
              className="rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 font-bold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              I found an item
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-blue-100">
            <span>✓ Campus-only community</span>
            <span>✓ Smart match suggestions</span>
            <span>✓ Safe claim flow</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-widest text-blue-600">HOW IT WORKS</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Three simple steps to reunite
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["01", "Report", "Add a few details about the item and where it was lost or found."],
            ["02", "Match", "Browse reports and receive relevant match suggestions."],
            ["03", "Recover", "Connect safely through the campus community."],
          ].map(([number, title, copy]) => (
            <div
              key={number}
              className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                {number}
              </span>
              <h2 className="mt-6 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-end justify-between gap-4">
          <div>
            <p className="font-bold tracking-widest text-blue-600">RECENT REPORTS</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Help return what matters</h2>
          </div>
          <Link
            to="/dashboard"
            className="hidden rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 sm:block"
          >
            View all reports →
          </Link>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.title} item={item} onClaim={() => handleOpenClaim(item)} />
          ))}
        </div>
      </section>

      {/* Claim Modal */}
      <ClaimModal
        open={isClaimModalOpen}
        item={selectedItem}
        onClose={handleCloseClaim}
        onSuccess={(data) => {
          console.log("Claim successfully submitted!", data);
        }}
      />
    </>
  );
}

export default Home;