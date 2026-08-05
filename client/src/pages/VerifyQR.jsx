import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastProvider";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VerifyQR() {
  const query = useQuery();
  const token = query.get("token") || "";
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    if (!token) {
      setMessage("No token provided in the QR.");
      addToast("No QR token found, please use a valid QR link.", "error");
    }
  }, [token, addToast]);

  async function submit() {
    if (!token) return;
    if (!isAuthenticated) {
      // redirect to login, return here after
      navigate("/login", { state: { from: `/verify-qr?token=${encodeURIComponent(token)}` } });
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.post("/items/verify-qr", { token });
      setMessage(data.message || "Verification succeeded.");
    } catch (err) {
      const message = err.response?.data?.message || "Verification failed.";
      setMessage(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-2xl font-bold">QR Verification</h1>
      <p className="mt-4 text-slate-600">This page verifies a scanned QR from an item owner. You must be signed in to complete verification.</p>
      <div className="mt-6">
        <p className="text-sm text-slate-700">Token</p>
        <code className="mt-2 block break-all rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800">{token || "(none)"}</code>
      </div>
      {message && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      <div className="mt-6 space-y-4">
        <button onClick={submit} disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Verifying…" : isAuthenticated ? "Verify and Claim" : "Sign in to verify"}
        </button>
        {loading && <LoadingSpinner label="Verifying" />}
      </div>
    </section>
  );
}

export default VerifyQR;
