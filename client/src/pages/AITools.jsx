import { useMemo, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

function AITools() {
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [results, setResults] = useState([]);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return preview || URL.createObjectURL(file);
  }, [file, preview]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : "");
    setOcrText("");
    setResults([]);
    setError("");
  };

  const analyzeImage = async () => {
    if (!file) {
      setError("Please choose an image to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/ai/similarity", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setOcrText(data.ocrText || "No text detected.");
      setResults(data.items || []);
    } catch (err) {
      const message = err.response?.data?.message || "Could not analyze the image.";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const askAssistant = async () => {
    if (!question.trim()) return;
    setChatLoading(true);
    setReply("");
    try {
      const { data } = await api.post("/ai/chat", { message: question });
      setReply(data.reply);
      setChatHistory((history) => [...history, { question, reply: data.reply }]);
      setQuestion("");
    } catch (err) {
      setReply(err.response?.data?.message || "Could not reach the assistant.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-semibold text-blue-600">AI SUPPORT</p>
          <h1 className="mt-2 text-3xl font-bold dark:text-white">Image similarity, OCR, and chat help</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Upload a photo to compare against open reports, scan an ID card, or ask the CampusFind assistant for guidance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:ring-slate-700">Back to dashboard</Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold dark:text-white">Image similarity & OCR</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Upload a photo or ID card and CampusFind will extract text and match it against open reports.</p>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Choose an image
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-blue-300" />
              </label>
              {previewUrl && <img src={previewUrl} alt="Preview" className="h-52 w-full rounded-3xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />}
              <button onClick={analyzeImage} disabled={loading} className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Analyzing…" : "Analyze image"}
              </button>
              {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            </div>

            {ocrText && (
              <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <p className="font-semibold">OCR text detected</p>
                <p className="mt-2 whitespace-pre-line">{ocrText}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold dark:text-white">Similar reports</h3>
                <div className="space-y-3">
                  {results.map((item) => (
                    <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold dark:text-white">{item.title}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.category} · {item.location}</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{item.score}%</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold dark:text-white">AI Chat Assistant</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ask CampusFind for help with reporting, matching, claiming, or OCR.</p>

            <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Your question
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <button onClick={askAssistant} disabled={chatLoading} className="mt-4 rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {chatLoading ? "Thinking…" : "Ask assistant"}
            </button>

            {reply && (
              <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <p className="font-semibold">Assistant reply</p>
                <p className="mt-2 whitespace-pre-line">{reply}</p>
              </div>
            )}
          </div>

          {chatHistory.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold dark:text-white">Conversation history</h2>
              <div className="mt-4 space-y-4">
                {chatHistory.slice().reverse().map((entry, index) => (
                  <div key={index} className="space-y-2 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">You:</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{entry.question}</p>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Assistant:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{entry.reply}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AITools;
