import { useState } from "react";
import { useAuth } from "../AuthContext";
import api, { API_ORIGIN } from "../api";

function ItemModal({ item, onClose, onMatch }) {
  const { user } = useAuth();
  const [qrToken, setQrToken] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const isOwner = user?.id === item?.ownerId;

  async function generateQr() {
    setQrLoading(true);
    try {
      const { data } = await api.get(`/items/${item.id}/qr-token`);
      setQrToken(data.token);
    } catch (err) {
      setQrToken("");
      alert(err.response?.data?.message || "Could not generate QR token.");
    } finally {
      setQrLoading(false);
    }
  }

  const verifyUrl = qrToken ? `${API_ORIGIN.replace(/\/api$/, "")}/verify-qr?token=${encodeURIComponent(qrToken)}` : "";
  const qrImage = verifyUrl ? `https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodeURIComponent(verifyUrl)}` : "";

  if (!item) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <span className="text-5xl">{item.icon}</span>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold dark:text-white">{item.title}</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.type === "Lost" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{item.type}</span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="mt-1 font-semibold dark:text-slate-100">{item.category}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="mt-1 font-semibold dark:text-slate-100">{item.location}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Reported</dt>
            <dd className="mt-1 font-semibold dark:text-slate-100">{item.date || item.when}</dd>
          </div>
        </dl>

        <p className="mt-6 rounded-xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item.description}</p>

        {onMatch && (
          <button onClick={() => { onClose(); onMatch(item); }} className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">Find possible matches</button>
        )}

        {isOwner && (
          <div className="mt-4">
            <p className="text-sm text-slate-600">Show this QR to a claimant to verify their claim.</p>
            <div className="mt-3 flex gap-3">
              <button onClick={generateQr} disabled={qrLoading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{qrLoading ? "Generating…" : "Show QR"}</button>
              <button onClick={() => { setQrToken(""); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Clear</button>
            </div>

            {qrToken && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <img src={qrImage} alt="QR code" className="h-48 w-48 rounded-lg" />
                <p className="text-sm text-slate-500">Or share this URL with the claimant:</p>
                <a href={verifyUrl} className="break-all text-sm text-blue-700">{verifyUrl}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemModal;
