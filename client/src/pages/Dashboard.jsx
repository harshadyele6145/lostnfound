import React, { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import ClaimModal from "../components/ClaimModal";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/items`);
      const data = await response.json();
      if (response.ok) {
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClaim = (item) => {
    setSelectedItem(item);
    setIsClaimModalOpen(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filter === "All" || item.type?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Community Board
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
          Browse recent reports
        </h1>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search items, locations, or descriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 sm:max-w-md dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />

        <div className="flex gap-2">
          {["All", "Lost", "Found"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filter === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {filteredItems.length} reports found
      </p>

      {loading ? (
        <div className="mt-12 text-center text-slate-500">Loading reports...</div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id || item.title}
              item={item}
              onClaim={() => handleOpenClaim(item)}
            />
          ))}
        </div>
      )}

      <ClaimModal
        open={isClaimModalOpen}
        item={selectedItem}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={() => {
          fetchItems();
        }}
      />
    </div>
  );
}

export default Dashboard;