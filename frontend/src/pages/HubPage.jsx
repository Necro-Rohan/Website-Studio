import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar, Footer } from "../components/blogpage/BlogSections.jsx";
import { AlertTriangle, Home, BarChart3, MapPin, Briefcase } from "lucide-react";
import api from "../utils/api.js";

export default function HubPage({ type }) {
  const { slug } = useParams();

  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchHubData = async () => {
      window.scrollTo(0, 0);
      setError(false);
      setLoading(true);
      setPage(1); // Reset page on slug change

      try {
        const res = await api.get(`/hub/${type}/${slug}?page=1&limit=24`);
        if (!isActive) return;

        setHubData(res.data);
        document.title = `${res.data.insights.title} | Website Studio`;
        document
          .querySelector('meta[name="description"]')
          ?.setAttribute("content", res.data.insights.subtitle);
      } catch {
        if (!isActive) return;
        setError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchHubData();

    return () => {
      isActive = false;
    };
  }, [type, slug]);

  const loadMore = () => {
    setLoadingMore(true);
    api.get(`/hub/${type}/${slug}?page=${page + 1}&limit=24`).then((res) => {
      setHubData((prev) => ({
        ...res.data,
        posts: [...prev.posts, ...res.data.posts], // Append new posts to existing
      }));
      setPage(page + 1);
      setLoadingMore(false);
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-6">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-[#191c1e] mb-4">
            Hub Not Found
          </h1>
          <p className="text-[#4a4455] text-lg mb-8">
            We don't have enough data to generate insights for this sector yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#5c218b] text-white rounded-full font-bold hover:bg-[#4a1a70] transition-colors gap-2"
          >
            <Home className="w-5 h-5" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !hubData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] animate-pulse text-[#5c218b] font-bold">
        Loading Hub Insights...
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Hub Hero Section (The "Value" Layer) */}
        <div className="bg-[#191c1e] text-white pt-24 pb-20 px-6 border-b-12 border-[#5c218b]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-[#e0b6ff] mb-6">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>
                {type === "location" ? "Local Market Hub" : "Industry Hub"}
              </span>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                  {hubData.insights.title}
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                  {hubData.insights.subtitle}
                </p>
              </div>

              {/* Dynamic Stats Box */}
              <div className="lg:col-span-4 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#5c218b]/30 flex items-center justify-center">
                    <BarChart3 className="text-[#e0b6ff] w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">
                      {hubData.totalGuides}
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Total Guides
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#5c218b]/30 flex items-center justify-center">
                    {type === "location" ? (
                      <Briefcase className="text-[#e0b6ff] w-6 h-6" />
                    ) : (
                      <MapPin className="text-[#e0b6ff] w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">
                      {hubData.insights.statValue}
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {hubData.insights.statLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Gain Section (What Works + Top Lists) */}
        <div className="max-w-7xl mx-auto px-6 pt-16 grid lg:grid-cols-3 gap-12 border-b border-slate-100">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-black text-slate-900">
              What Works in This Market
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Based on our analysis of {hubData.totalGuides} digital blueprints,
              successful{" "}
              {type === "location" ? "local businesses" : "operators"}{" "}
              prioritize mobile-first loading speeds, integrated booking
              systems, and structured local SEO. Businesses that implement these
              core features see significantly higher customer retention and
              organic discovery.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {hubData.insights.listTitle}
            </h3>
            <ul className="space-y-4">
              {hubData.topList.map((item, i) => (
                <li key={i}>
                  <Link
                    to={`/blog/${type === "location" ? "category" : "location"}/${item.slug}`}
                    className="flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-[#5c218b] transition-colors">
                      {item._id}
                    </span>
                    <span className="text-sm font-bold bg-white px-3 py-1 rounded-full text-[#5c218b] shadow-sm">
                      {item.count} Guides
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The Link Grid (Crawlable Architecture) */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-black text-slate-900 mb-10">
            Explore All Strategies
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hubData.posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.h1}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#dae2fd]"></div>
                  )}
                  {/* Category/Location Tag */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#5c218b] text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-full">
                    {type === "location" ? post.category : post.geography}
                  </div>
                </div>
                <div className="p-6 md:p-8 grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug mb-3 group-hover:text-[#5c218b] transition-colors line-clamp-3">
                      {post.h1}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                      {post.metaDescription}
                    </p>
                  </div>
                  <div className="mt-6 font-bold text-[#5c218b] text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Full Guide <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination / Load More Button */}
          {hubData.currentPage < hubData.totalPages && (
            <div className="text-center mt-16">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-white border-2 border-[#5c218b] text-[#5c218b] font-bold py-4 px-10 rounded-full hover:bg-[#5c218b] hover:text-white transition-all disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More Strategies"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}