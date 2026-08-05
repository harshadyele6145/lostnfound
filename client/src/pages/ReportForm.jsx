import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastProvider";

function ReportForm({ type }) {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const title = type === "lost" ? "Report a lost item" : "Report a found item";

  async function submit(e) {
    e.preventDefault();
    if (!localStorage.getItem("campusfind_token")) return navigate("/login");
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const payload = Object.fromEntries(formData.entries());
      delete payload.image;

      if (selectedImage) {
        const uploadData = new FormData();
        uploadData.append("image", selectedImage);
        const upload = await api.post("/uploads", uploadData);
        payload.imageUrl = upload.data.imageUrl;
        payload.imagePublicId = upload.data.imagePublicId || null;
      }

      await api.post("/items", { ...payload, type });
      setSubmitted(true);
      addToast("Report submitted successfully.", "success");
    } catch (err) {
      const message = err.response?.data?.message || "Could not submit the report.";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImage(null);
      setPreview("");
      return;
    }
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <div className="text-4xl">✓</div>
          <h1 className="mt-4 text-3xl font-bold">Report submitted</h1>
          <p className="mt-3 text-slate-600">We'll show relevant matches as they are reported.</p>
          <Link to="/dashboard" className="mt-6 inline-block font-semibold text-blue-700">View community board →</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600">The more detail you provide, the easier it is to find a match.</p>

      <form onSubmit={submit} className="mt-7 grid gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
        {[["Item name", "e.g. Blue water bottle", "title"], ["Category", "e.g. Electronics", "category"], ["Location", "e.g. Central Library", "location"], ["Date", "e.g. 3 August", "date"]].map(([label, placeholder, name]) => (
          <label key={label} className="block text-sm font-medium">
            {label}
            <input
              required
              name={name}
              placeholder={placeholder}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
        ))}

        <label className="block text-sm font-medium sm:col-span-2">
          Description
          <textarea
            required
            name="description"
            rows="4"
            placeholder="Colour, brand, identifying marks, and other helpful details"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block text-sm font-medium sm:col-span-2">
          Item photo <span className="font-normal text-slate-500">(optional, max 5 MB)</span>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-slate-900 dark:text-white file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
          />
        </label>

        {preview && (
          <div className="sm:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
              <img src={preview} alt="Image preview" className="h-52 w-full rounded-2xl object-cover" />
              <button type="button" onClick={() => { setSelectedImage(null); setPreview(""); }} className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-200">
                Remove photo
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}

        <button disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:col-span-2">
          {loading ? "Submitting…" : "Submit report"}
        </button>

        {loading && (
          <div className="sm:col-span-2">
            <LoadingSpinner label="Submitting report" />
          </div>
        )}
      </form>
    </section>
  );
}

export default ReportForm;
