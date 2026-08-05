import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";
const navLink = ({ isActive }) => `text-sm font-medium transition ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-400"}`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("campusfind_theme") === "dark");
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("campusfind_theme", dark ? "dark" : "light");
  }, [dark]);

  const publicLinks = [["/", "Home"]];
  const privateLinks = [["/report-lost", "Report lost"], ["/report-found", "Report found"], ["/dashboard", "Dashboard"], ["/analytics", "Analytics"], ["/profile", "Profile"], ["/my-reports", "My reports"], ["/my-claims", "My claims"], ["/claims-history", "Claim history"]];
  const links = isAuthenticated ? [...publicLinks, ...privateLinks, ["/ai-tools", "AI tools"]] : publicLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <nav className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg text-white">⌕</span>
            <span>Campus<span className="text-blue-600 dark:text-blue-400">Find</span></span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className={navLink}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Toggle dark mode">
              {dark ? "☀" : "☾"}
            </button>
            {isAuthenticated ? (
              <>
                <span className="hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:block">
                  Welcome, {user?.name?.split(" ")[0] || user?.email}
                </span>
                <button onClick={logout} className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:block">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:block">
                Sign in
              </Link>
            )}
            <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-lg text-xl text-slate-700 hover:bg-slate-100 md:hidden dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Open navigation">
              {open ? "×" : "☰"}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-4 grid gap-1 border-t border-slate-100 pt-4 md:hidden dark:border-slate-800">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} end={to === "/"} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}>
                {label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button onClick={() => { setOpen(false); logout(); }} className="mt-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                Logout
              </button>
            ) : (
              <Link onClick={() => setOpen(false)} to="/login" className="mt-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white">
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
