import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useToast } from "../components/ToastProvider";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const { data } = await api.post("/auth/login", Object.fromEntries(form));
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Unable to sign in.";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to manage your reports and matches.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">
            College email
            <input required name="email" type="email" placeholder="you@college.edu" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input required name="password" type="password" placeholder="••••••••" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New here? <Link className="font-semibold text-blue-700" to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
