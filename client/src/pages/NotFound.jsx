import { Link } from "react-router-dom";
function NotFound() { return <section className="px-4 py-24 text-center"><p className="text-7xl font-black text-blue-600">404</p><h1 className="mt-3 text-3xl font-bold">Page not found</h1><Link to="/" className="mt-6 inline-block font-semibold text-blue-700">Return home →</Link></section>; }
export default NotFound;
