import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { getImageSrc } from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastProvider";

function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    type: "lost",
    imageUrl: "",
    imagePublicId: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    async function loadItem() {
      try {
        const response = await api.get(`/items/${id}`);
        const item = response.data;
        setFormData({
          title: item.title || "",
          description: item.description || "",
          location: item.location || "",
          category: item.category || "",
          type: item.type || "lost",
          imageUrl: item.imageUrl || "",
          imagePublicId: item.imagePublicId || null,
        });
        setPreview(item.imageUrl ? getImageSrc(item.imageUrl) : "");
      } catch (err) {
        const message = err.response?.data?.message || "Unable to load item.";
        setError(message);
        addToast(message, "error");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files?.[0];
      if (file) {
        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
      } else {
        setSelectedImage(null);
        setPreview(formData.imageUrl ? getImageSrc(formData.imageUrl) : "");
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const update = { ...formData };
      if (selectedImage) {
        const uploadData = new FormData();
        uploadData.append("image", selectedImage);
        const upload = await api.post("/uploads", uploadData);
        update.imageUrl = upload.data.imageUrl;
        update.imagePublicId = upload.data.imagePublicId || null;
      }

      if (!selectedImage && preview === "") {
        update.imageUrl = "";
        update.imagePublicId = null;
      }

      delete update.imageFile;
      await api.patch(`/items/${id}`, update);
      navigate("/my-reports");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update item.");
    }
  }

  function handleRemoveImage() {
    setSelectedImage(null);
    setPreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "", imagePublicId: null }));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <LoadingSpinner label="Loading report" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit report</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Update your lost or found report details.</p>

        {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Title</span>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Location</span>
            <input
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category</span>
            <input
              name="category"
              type="text"
              value={formData.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Report type</span>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Item photo</span>
            <div className="mt-2 flex flex-col gap-3">
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-slate-900 dark:text-white file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
              />
              {preview && (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
                  <img src={preview} alt="Preview" className="h-52 w-full rounded-2xl object-cover" />
                  <button type="button" onClick={handleRemoveImage} className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-200">
                    Remove photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            Save report
          </button>
          {loading && <LoadingSpinner label="Updating" />}
        </form>
      </div>
    </section>
  );
}

export default EditItem;
