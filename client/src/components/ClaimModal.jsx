import React, { useState } from "react";
import { useAuth } from "../AuthContext";

function ClaimModal({ open, item, onClose, onSuccess }) {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("You must be logged in to submit a claim.");
      return;
    }

    if (!message.trim()) {
      setError("Please provide a message explaining why this item is yours.");
      return;
    }

    try {
      setSubmitting(true);
      
      // Get base API URL
      let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      // Ensure API_URL ends cleanly without double slashes
      API_URL = API_URL.replace(/\/$/, "");

      const response = await fetch(`${API_URL}/items/${item.id}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proofDetails: message }),
      });

      // Handle non-JSON responses (e.g. 404/500 HTML pages) safely
      const contentType = response.headers.get("content-type");
      let data = {};

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON Server Response:", text);
        throw new Error(
          `Server returned an invalid response (${response.status}). Please verify your backend API deployment.`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit claim.");
      }

      setSuccess("Claim submitted successfully!");
      setMessage("");

      if (onSuccess) {
        onSuccess(data);
      }

      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">CLAIM ITEM</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {item.location} · {item.category || "General"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Explain why this item is yours. Include a detail only the owner
            would know, such as a unique mark or exact place it was left.
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Your message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={submitting}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Describe unique marks, contents, or exact location where you lost it..."
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit claim"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClaimModal;