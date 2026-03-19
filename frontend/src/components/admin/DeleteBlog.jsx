import React, { useState } from "react";
import api from "../../utils/api";
import { Link2, Trash2 } from "lucide-react";

export default function DeleteBlog({ secretKey }) {
  const [deleteSlug, setDeleteSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!secretKey) return setMessage({ type: "error", text: "Master Admin Key required!" });
    if (!deleteSlug) return;
    
    const confirmDelete = window.confirm(`Irreversible Action: Are you absolutely sure you want to delete '${deleteSlug}'?`);
    if (!confirmDelete) return;

    setLoading(true); setMessage(null);
    try {
      await api.delete(`/blog/${deleteSlug}`, { headers: { "x-admin-secret": secretKey } });
      setMessage({ type: "success", text: "Blog permanently deleted." });
      setDeleteSlug(""); 
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Failed to delete blog." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-16 flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-error-container text-error rounded-full mb-6">
            <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <h2 className="font-headline text-5xl font-bold tracking-tight text-on-surface mb-4">
            Danger Zone
          </h2>
          <p className="text-on-surface-variant/80 font-body max-w-md mx-auto leading-relaxed">
            Actions performed here are irreversible. Please ensure you have
            backed up any critical editorial data before proceeding with
            permanent deletion.
          </p>
        </header>

        {message && (
          <div
            className={`p-4 mb-6 rounded-lg font-bold font-body ${message.type === "error" ? "bg-error-container text-error" : "bg-tertiary-container text-on-tertiary-container"}`}
          >
            {message.text}
          </div>
        )}

        <section className="bg-surface rounded-xl p-8 md:p-12 shadow-sm border border-outline">
          <form onSubmit={handleDelete} className="space-y-8">
            <div>
              <label className="block font-headline text-xl font-semibold text-on-surface mb-2">
                Target Blog Slug
              </label>
              <p className="text-sm text-on-surface-variant mb-6 font-body">
                Enter the unique identifier (slug) of the blog post you wish to
                erase from the database.
              </p>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-on-surface-variant">
                  <Link2 className="w-5 h-5 " />
                </span>
                <input
                  disabled={loading}
                  value={deleteSlug}
                  onChange={(e) => setDeleteSlug(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-error transition-all font-body text-on-surface"
                  placeholder="e.g., top-salon-in-pune"
                  type="text"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !deleteSlug}
                className="w-full bg-error hover:bg-on-error-container text-on-error font-headline text-lg font-bold py-5 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                {loading ? "Deleting..." : "Permanently Delete Blog"}
              </button>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mt-4 font-body italic">
                Note: This action cannot be undone. Ensure you have the correct
                slug and have backed up any necessary data before confirming.
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}