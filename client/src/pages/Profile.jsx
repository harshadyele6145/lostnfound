import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

function Profile() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Profile</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Your account</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Manage your account details and view your active reports.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Name</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Email</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-blue-50 p-6 text-blue-900 dark:bg-blue-950 dark:text-blue-200">
          <p className="font-semibold">Quick links</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/my-reports" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-100">My reports</Link>
            <Link to="/my-claims" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-100">Claim requests</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
