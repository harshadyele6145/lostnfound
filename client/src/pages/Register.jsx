import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useToast } from "../components/ToastProvider";

function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", Object.fromEntries(new FormData(event.currentTarget)));
      login(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Unable to create your account.";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-slate-600">Join your campus lost & found community.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {[
            ["Full name", "Your name", "text", "name"],
            ["College email", "you@college.edu", "email", "email"],
            ["Password", "At least 6 characters", "password", "password"],
          ].map(([label, placeholder, type, name]) => (
            <label key={label} className="block text-sm font-medium">
              {label}
              <input required name={name} minLength={name === "password" ? 6 : undefined} type={type} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
          ))}
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-blue-700" to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
