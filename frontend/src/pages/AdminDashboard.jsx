import React, { useState } from "react";
import api from "../utils/api.js"

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    adjective: "",
    category: "",
    geography: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [secretKey, setSecretKey] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.adjective || !formData.category || !formData.geography) {
      setMessage({ type: "error", text: "Please fill all fields" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post("/generate", formData,
        { headers: {
          "x-admin-secret": secretKey,
          },
        }
      );
      setMessage({
        type: "success",
        text:
          "Page generated successfully! Checkout /blog/" +
          response.data.post.slug,
      });
      setFormData({ adjective: "", category: "", geography: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to generate content.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f6f6f8] text-slate-900 min-h-screen flex flex-col items-center py-10">
      <div className="w-full max-w-200 px-6">
        <h1 className="text-3xl font-black mb-2">SEO Page Generator</h1>
        <p className="text-slate-500 mb-8">
          Enter parameters to generate programmatic SEO pages.
        </p>

        {message && (
          <div
            className={`p-4 mb-6 rounded-lg font-bold ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <div>
            <label className="block text-sm font-semibold mb-2">
              Adjective
            </label>
            <input
              disabled={loading}
              value={formData.adjective}
              onChange={(e) =>
                setFormData({ ...formData, adjective: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border bg-slate-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="e.g., Best, Top"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <input
              disabled={loading}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border bg-slate-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="e.g., Salon, Plumber"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Geography
            </label>
            <input
              disabled={loading}
              value={formData.geography}
              onChange={(e) =>
                setFormData({ ...formData, geography: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border bg-slate-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="e.g., New York, Mumbai"
            />
          </div>
          <div className="pt-4 border-t border-slate-200 mt-2">
            <label className="block text-sm font-semibold mb-2 text-red-600">
              Admin Secret Key
            </label>
            <input
              type="password"
              required
              disabled={loading}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-red-200 bg-red-50 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              placeholder="Enter the secret key"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-lg mt-2 disabled:bg-blue-400 disabled:cursor-wait"
          >
            {loading ? "Generating..." : "Generate SEO Page"}
          </button>
        </form>
      </div>
    </div>
  );
}
