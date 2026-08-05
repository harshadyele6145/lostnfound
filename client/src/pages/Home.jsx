import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const items = [
  { icon: "🎧", title: "Black wireless headphones", type: "Found", location: "Central Library", when: "Today", description: "Found near the second-floor study area." },
  { icon: "💳", title: "Student ID card", type: "Lost", location: "Engineering Block", when: "Yesterday", description: "Name begins with A. Last seen outside Lab 204." },
  { icon: "🔑", title: "Keychain with blue tag", type: "Found", location: "Main Cafeteria", when: "Yesterday", description: "Handed in at the cafeteria counter." },
];

function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-medium">A smarter campus lost & found</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Lost something? Let campus help.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">Report lost or found items, discover matches, and get your belongings back—without the notice-board chaos.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/report-lost" className="rounded-xl bg-white px-6 py-3 font-bold text-blue-700 shadow-lg hover:bg-blue-50">I lost an item</Link>
            <Link to="/report-found" className="rounded-xl border border-white/50 px-6 py-3 font-bold hover:bg-white/10">I found an item</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[['1', 'Report', 'Add a few details about the item and where it was lost or found.'], ['2', 'Match', 'Browse reports and receive relevant match suggestions.'], ['3', 'Recover', 'Connect safely through the campus community.']].map(([number, title, copy]) => <div key={number} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><span className="text-sm font-bold text-blue-600">0{number}</span><h2 className="mt-3 text-xl font-bold">{title}</h2><p className="mt-2 text-slate-600">{copy}</p></div>)}
        </div>
        <div className="mt-16 flex items-end justify-between gap-4"><div><p className="font-semibold text-blue-600">RECENT REPORTS</p><h2 className="mt-2 text-3xl font-bold">Help return what matters</h2></div><Link to="/dashboard" className="hidden text-sm font-semibold text-blue-700 sm:block">View all reports →</Link></div>
        <div className="mt-7 grid gap-5 md:grid-cols-3">{items.map((item) => <ItemCard key={item.title} item={item} />)}</div>
      </section>
    </>
  );
}

export default Home;
