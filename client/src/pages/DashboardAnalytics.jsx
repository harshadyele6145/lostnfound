import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import api from "../api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function DashboardAnalytics() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [charts, setCharts] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [location, setLocation] = useState("");

  const fetchAll = async (opts = {}) => {
    const params = { from: opts.from || from || undefined, to: opts.to || to || undefined, location: opts.location || location || undefined };
    api.get("/analytics/summary", { params }).then((r) => setSummary(r.data)).catch(() => {});
    api.get("/analytics/monthly", { params }).then((r) => setMonthly(r.data.data || [])).catch(() => {});
    api.get("/analytics/charts", { params }).then((r) => setCharts(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll({}); }, []);

  const monthlyLabels = monthly.map((m) => m.label);
  const lostData = monthly.map((m) => m.lost);
  const foundData = monthly.map((m) => m.found);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-4 text-2xl font-bold">Analytics</h1>

      <div className="mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 rounded-md border px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm">Location</label>
          <input placeholder="Campus or building" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchAll({})} className="ml-2 rounded bg-blue-600 px-4 py-2 text-white">Apply</button>
          <button onClick={() => { setFrom(""); setTo(""); setLocation(""); fetchAll({ from: undefined, to: undefined, location: undefined }); }} className="rounded border px-4 py-2">Reset</button>
        </div>
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">Total lost: <div className="text-2xl font-semibold">{summary.totalLost}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">Total found: <div className="text-2xl font-semibold">{summary.totalFound}</div></div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">Recovery rate: <div className="text-2xl font-semibold">{summary.recoveryRate}%</div></div>
        </div>
      )}

      <div className="mb-8 rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Monthly reports (last 12 months)</h2>
        <Line data={{ labels: monthlyLabels, datasets: [{ label: "Lost", data: lostData, borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.1)" }, { label: "Found", data: foundData, borderColor: "#16a34a", backgroundColor: "rgba(16,163,74,0.1)" }] }} />
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Reports by month</h2>
        {charts ? <Bar data={{ labels: charts.labels, datasets: [{ label: "Lost", data: charts.datasets.lost, backgroundColor: "#2563eb" }, { label: "Found", data: charts.datasets.found, backgroundColor: "#16a34a" }] }} /> : <p>Loading charts...</p>}
      </div>
    </div>
  );
}
