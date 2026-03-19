import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Sparkles, MapPin, Rocket, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from "lucide-react";

export default function AddBlog({ secretKey }) {
  // BLOG GENERATOR STATE 
  const [formData, setFormData] = useState({ adjective: "", category: "", geography: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // RECENT BLOGS STATE 
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [isFetchingBlogs, setIsFetchingBlogs] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPosts: 0, totalPages: 1 });

  // Fetch blogs when component mounts or page changes
  useEffect(() => {
    fetchRecentBlogs(page);
  }, [page]);

  const fetchRecentBlogs = async (currentPage = 1) => {
    setIsFetchingBlogs(true);
    try {
      const response = await api.get(`/blogs?page=${currentPage}&limit=5`);
      setRecentBlogs(response.data.posts || []);
      setPagination({
        totalPosts: response.data.totalPosts || 0,
        totalPages: response.data.totalPages || 1,
      });
    } catch (error) {
      console.error("Failed to fetch recent blogs", error);
    } finally {
      setIsFetchingBlogs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secretKey) return setMessage({ type: "error", text: "Master Admin Key required!" });
    if (!formData.adjective || !formData.category || !formData.geography) return setMessage({ type: "error", text: "Please fill all fields" });

    setLoading(true); setMessage(null);
    try {
      await api.post("/generate", formData, { headers: { "x-admin-secret": secretKey } });
      setMessage({ type: "success", text: "Job added to queue! AI is writing your blog." });
      setFormData({ adjective: "", category: "", geography: "" });
      
      // Refresh the table after 3 seconds (giving the AI queue time to start)
      setTimeout(() => fetchRecentBlogs(1), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Failed to generate." });
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-10 animate-fade-in">
      
      <header>
        <h2 className="text-4xl font-semibold font-headline tracking-tight text-on-surface">Generate New Blog</h2>
        <p className="text-on-surface-variant mt-2 font-body">Create SEO-optimized editorial content instantly.</p>
      </header>

      {message && <div className={`p-4 rounded-lg font-bold font-body ${message.type === "error" ? "bg-error-container text-error" : "bg-tertiary-container text-on-tertiary-container"}`}>{message.text}</div>}

      {/* 1. CONTENT PARAMETERS FORM */}
      <div className="bg-surface p-8 rounded-xl border border-outline/50 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-primary"><Sparkles className="w-5 h-5" /></span>
          <h3 className="text-xl font-bold font-headline">Content Parameters</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary font-body">Adjective</label>
              <input disabled={loading} value={formData.adjective} onChange={(e) => setFormData({...formData, adjective: e.target.value})} className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded py-3 px-4 text-on-surface font-body" placeholder="e.g. Luxurious, Minimalist" type="text" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary font-body">Category</label>
              <input disabled={loading} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded py-3 px-4 text-on-surface font-body" placeholder="e.g. Architecture, Tech" type="text" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary font-body">Geography</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><MapPin className="w-5 h-5" /></span>
              <input disabled={loading} value={formData.geography} onChange={(e) => setFormData({...formData, geography: e.target.value})} className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded py-3 pl-10 pr-4 text-on-surface font-body" placeholder="e.g. Tokyo, Tuscany" type="text" />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-on-primary font-bold text-lg rounded-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              <Rocket className="w-5 h-5" />
              {loading ? "Generating Payload..." : "Generate SEO Page"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. RECENT GENERATIONS TABLE */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-headline">Recent Generations</h3>
          <button 
            onClick={() => fetchRecentBlogs(1)} 
            disabled={isFetchingBlogs}
            className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingBlogs ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="bg-white border border-outline/50 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant border-b border-outline/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary whitespace-nowrap">Page Title</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary whitespace-nowrap">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary text-right whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/30">
                {recentBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-secondary font-medium">
                      {isFetchingBlogs ? "Loading generations..." : "No SEO pages generated yet."}
                    </td>
                  </tr>
                ) : (
                  recentBlogs.map((post) => (
                    <tr key={post.slug} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-surface-container-high overflow-hidden shrink-0 border border-outline/50">
                            {/* Fallback to generic image if no coverImage exists */}
                            <img 
                              src={post.coverImage || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&q=80&auto=format&fit=crop"} 
                              alt="Thumbnail" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <a 
                              href={`/blog/${post.slug}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1"
                            >
                              {post.h1 || "Untitled Page"}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                            <span className="text-xs text-on-surface-variant font-mono">/blog/{post.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase rounded tracking-wider">
                          {post.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-on-surface-variant italic capitalize">
                          {post.category || post.geography}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-medium text-secondary">
                          {formatDate(post.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline/30 flex justify-between items-center">
            <span className="text-xs text-secondary font-medium italic">
              Showing {recentBlogs.length} of {pagination.totalPosts} generations
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1 || isFetchingBlogs}
                onClick={() => setPage(page - 1)}
                className="p-1 hover:bg-surface-variant rounded disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-secondary" />
              </button>
              <button 
                disabled={page >= pagination.totalPages || isFetchingBlogs}
                onClick={() => setPage(page + 1)}
                className="p-1 hover:bg-surface-variant rounded disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}