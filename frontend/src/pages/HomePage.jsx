import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js'; 

const getImgUrl = (url) => {
  if (!url) return "";
  if (url.includes("cloudinary.com") && !url.includes("w_600")) {
    return url.replace("/upload/", "/upload/w_600,f_auto,q_auto/");
  }
  if (url.includes("unsplash.com") && !url.includes("w=")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}w=600&q=80&fm=webp`;
  }
  return url;
};

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      let newLimit = 10;
      if (window.innerWidth < 768) {
        newLimit = 5; // Mobile
      } else if (window.innerWidth < 1024) {
        newLimit = 7; // Tablet
      } else {
        newLimit = 10; // Desktop
      }
      setItemsPerPage((prevLimit) => {
        if (prevLimit !== newLimit) setCurrentPage(1);
        return newLimit;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.title = "Website Studio | Best Website Builder Reviews & Guides";

    // function to update or create meta tags
    const setMetaTag = (attr, value, content) => {
      let element = document.querySelector(`meta[${attr}="${value}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const blogDescription = "Discover the best website builder platforms for your local business. Read our expert blog reviews, comparisons, and guides at Website Studio.";

    // Standard Description
    setMetaTag("name", "description", blogDescription);

    // OpenGraph / Social Media Tags
    setMetaTag("property", "og:title", "Website Studio | Best Website Builder Reviews");
    setMetaTag("property", "og:description", blogDescription);
    setMetaTag("property", "og:type", "website");
    
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      api.get(`/blogs?page=${currentPage}&limit=${itemsPerPage}&status=published`)
        .then((res) => {
          setPosts(res.data.posts);
          setTotalPages(res.data.totalPages);
          setTotalPosts(res.data.totalPosts);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch posts", err);
          setLoading(false);
        });
    }

    fetchBlogs()
  }, [currentPage, itemsPerPage]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationGroup = () => {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // If we are near the beginning, shift the window so we always show 5 buttons
    if (currentPage <= 2) {
      endPage = Math.min(totalPages, 5);
    }
    // If we are near the end, shift the window back
    if (currentPage >= totalPages - 1) {
      startPage = Math.max(1, totalPages - 4);
    }

    const pages = [];
    if (startPage > 1) pages.push("..."); 

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) pages.push("..."); 

    return pages;
  };

  return (
    <div className="bg-[#f7f9fb]/90 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-600/20 selection:text-[#5c218b]">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-[#f7f9fb]/90 backdrop-blur-xl transition-all duration-300 border-b border-slate-200/50">
        <div className="mx-auto flex h-16 max-w-7xl py-4 items-center justify-between px-3 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-2xl font-black text-[#5c218b] tracking-tighter flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-[#5c218b] rounded-lg flex items-center justify-center">
                <img
                  src="/InstaWeb-Labs-icon.svg"
                  className="w-5 h-5 invert brightness-0"
                  alt="Logo"
                />
              </div>
              Website Studio
            </Link>
          </div>
          <a
            href="https://websites.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-linear-to-br from-[#5c218b] to-[#753ca5] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all"
          >
            Start Building
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-24 md:pt-32 pb-10 grow w-full">
        {/* Hero Section */}
        <section className="mb-15 md:mb-10 max-w-3xl ">
          <h1
            className="text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight text-slate-900 mb-6 italic"
            style={{ fontFamily: "'Newsreader', serif" }}
          >
            The Growth Hub
          </h1>
          <p className="text-xl leading-relaxed text-slate-600 w-full">
            Actionable growth strategies, expert platform reviews, and local SEO
            playbooks to help your business dominate the digital market.
          </p>
        </section>

        {loading && posts.length === 0 ? (
          <>
            {/* Skeleton Hero (Hidden on Mobile) */}
            <div className="hidden md:flex flex-col md:flex-row gap-8 lg:gap-12 mb-20 animate-pulse w-full">
              <div className="w-full md:w-2/3 aspect-video md:aspect-16/10 bg-slate-200 rounded-xl"></div>
              <div className="w-full md:w-1/3 flex flex-col justify-center">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-full mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-6 grow"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 mt-auto"></div>
              </div>
            </div>

            {/* Skeleton Standard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {[...Array(itemsPerPage || 9)].map((_, i) => (
                <div
                  key={i}
                  className={`flex flex-col h-full animate-pulse ${i === 0 ? "md:hidden" : ""}`}
                >
                  <div className="aspect-video bg-slate-200 rounded-xl mb-6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                  <div className="h-8 bg-slate-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-6 grow"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/2 mt-auto"></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            className={`transition-opacity duration-300 ${loading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
          >
            {/* THE HERO SECTION (Hidden on Mobile) */}
            {posts.length > 0 && (
              <div className="hidden md:block mb-20">
                <Link
                  to={`/blog/${posts[0].slug}`}
                  className="group relative flex flex-col justify-end rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-[#191c1e] min-h-112.5 lg:min-h-137.5"
                >
                  {/* Big Hero Image Background */}
                  <img
                    src={posts[0].coverImage}
                    alt={posts[0].h1}
                    loading="eager"
                    fetchpriority="high"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-[#191c1e] via-[#191c1e]/30 to-transparent"></div>

                  {/* Hero Text Content */}
                  <div className="relative z-10 w-full flex flex-col justify-end text-start p-8 md:p-6 lg:p-6 mt-auto">
                    {/* Meta Tags */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#5c218b] text-white border border-[#e0b6ff]/30 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg">
                        {posts[0].category}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#e0b6ff]">
                        {posts[0].geography}
                      </span>
                    </div>

                    {/* Typography */}
                    <h2
                      className="text-3xl lg:text-4xl font-bold leading-[1.15] text-white mb-2 drop-shadow-md"
                      style={{ fontFamily: "'Newsreader', serif" }}
                    >
                      {posts[0].h1}
                    </h2>
                    <p className="text-lg text-white/80  line-clamp-2 mb-2 max-w-2xl drop-shadow">
                      {posts[0].metaDescription}
                    </p>

                    {/* Author/Date Row & CTA */}
                    <div className="flex items-center justify-between border-t border-white/20 pt-6 mt-auto">
                      <div className="flex items-center gap-4 text-sm font-medium text-white/70">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-[#e0b6ff] flex items-center justify-center text-[#5c218b] font-bold text-xs shadow-inner">
                            WS
                          </div>
                          <span className="text-white font-semibold tracking-wide">
                            Websites Team
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(posts[0].createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      <div className="font-black text-sm text-white flex items-center gap-2 uppercase tracking-widest group-hover:text-[#e0b6ff] transition-colors">
                        Read Guide
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#e0b6ff] group-hover:text-[#5c218b] transition-colors duration-300 ml-2 backdrop-blur-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {posts.map((post, index) => {
                const isFirstPost = index === 0;

                return (
                  <Link
                    to={`/blog/${post.slug}`}
                    key={post._id}
                    // To Hide the first post on tablets and desktops
                    className={`group flex flex-col h-full ${isFirstPost ? "md:hidden" : ""}`}
                  >
                    {/* Image Wrapper */}
                    <div className="aspect-16/10 bg-slate-100 rounded-xl overflow-hidden mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500 relative">
                      <img
                        src={getImgUrl(post.coverImage)}
                        alt={post.h1}
                        loading={isFirstPost ? "eager" : "lazy"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Meta Tags */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#5c218b]">
                        {post.category}
                      </span>
                      <span className="size-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {post.geography}
                      </span>
                    </div>

                    {/* Typography */}
                    <h2
                      className="text-2xl font-semibold leading-snug text-slate-900 mb-3 group-hover:text-[#5c218b] transition-colors"
                      style={{ fontFamily: "'Newsreader', serif" }}
                    >
                      {post.h1}
                    </h2>
                    <p className="text-[16px] text-slate-600 leading-relaxed line-clamp-2 mb-4">
                      {post.metaDescription}
                    </p>

                    {/* Author/Date Row */}
                    <div className="mt-auto flex items-center gap-3 text-sm font-medium text-slate-500 border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-[#e0b6ff] flex items-center justify-center text-[#5c218b] font-bold text-[10px]">
                          WS
                        </div>
                        <span className="text-slate-700">Websites Team</span>
                      </div>
                      <span>•</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-15 flex flex-col justify-center gap-8 border-t border-slate-100 pt-10">
                <div className="flex items-center justify-center gap-20">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="hidden sm:flex items-center gap-2.5 text-sm font-bold text-slate-900 hover:text-[#5c218b] disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center justify-around">
                    {getPaginationGroup().map((number, index) =>
                      number === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="flex size-8 items-end justify-center text-slate-500 text-lg font-bold tracking-widest pb-2"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`flex size-8 items-center justify-center rounded text-xs font-bold transition-all duration-300 ${
                            currentPage === number
                              ? "bg-[#5c218b] text-white shadow-md shadow-[#5c218b]/30"
                              : "hover:bg-[#e0b6ff]/30 hover:text-[#5c218b] text-slate-600"
                          }`}
                        >
                          {number}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex items-center gap-2.5 text-sm font-bold text-slate-900 hover:text-[#5c218b] disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>

                <p className="text-sm text-slate-500 text-center">
                  Showing{" "}
                  <span className="font-bold text-[#5c218b]">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-[#5c218b]">
                    {Math.min(currentPage * itemsPerPage, totalPosts)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#5c218b]">{totalPosts}</span>{" "}
                  guides
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-[#e0b6ff]/50 mt-10">
            <h2 className="text-xl font-bold text-[#5c218b] mb-2">
              No guides published yet
            </h2>
            <p className="text-slate-500 mb-6">
              Head over to the admin dashboard to generate your first SEO page.
            </p>
            <Link
              to="/admin"
              className="bg-[#5c218b] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e0b6ff] hover:text-[#5c218b] transition-all shadow-md hover:shadow-lg"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        )}
      </main>

      {/* Large Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-12 mt-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
            <div className="col-span-2 md:col-span-3 lg:col-span-2 mb-6 lg:mb-0">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="flex size-8 items-center justify-center bg-[#5c218b] text-white rounded shadow-sm">
                  <img
                    src="/InstaWeb-Labs-icon.svg"
                    className="w-4 h-4 invert brightness-0"
                    alt="Logo"
                  />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Website Studio
                </span>
              </div>
              <p className="text-slate-500 max-w-sm text-[15px] leading-relaxed mb-6">
                Empowering local businesses with professional, high-performance
                web presence. Built for speed, optimized for growth.
              </p>
            </div>

            {/* Column 1 */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#5c218b] mb-6">
                Company
              </h4>
              <nav className="flex flex-col gap-4">
                <Link
                  to="/about"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  to="/editorial-guidelines"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  Editorial Guidelines
                </Link>
              </nav>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#5c218b] mb-6">
                Resources
              </h4>
              <nav className="flex flex-col gap-4">
                <Link
                  to="/"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="/categories"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  Top Categories
                </Link>
                <a
                  href="/sitemap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  Sitemap
                </a>
              </nav>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#5c218b] mb-6">
                Connect
              </h4>
              <nav className="flex flex-col gap-4">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-500 hover:text-[#5c218b] transition-colors"
                >
                  Instagram
                </a>
              </nav>
            </div>
          </div>

          {/* Legal Bar (Bottom) */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-8 border-t border-slate-200">
            {/* Copyright & Credit */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-slate-500">
                © {new Date().getFullYear()} Website Studio | Smart Website
                Builder for Local Businesses
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                AI Pipeline built with{" "}
                <a
                  href="https://pollinations.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5c218b] underline transition-colors font-bold"
                >
                  pollinations.ai
                </a>
              </p>
            </div>

            {/* Legal Links - Wrapped for Mobile */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to="/affiliate-disclosure"
                onClick={() => window.scrollTo(0, 0)}
                className="text-xs font-semibold text-slate-500 hover:text-[#5c218b] transition-colors"
              >
                Affiliate Disclosure
              </Link>
              <Link
                to="/privacy-policy"
                onClick={() => window.scrollTo(0, 0)}
                className="text-xs font-semibold text-slate-500 hover:text-[#5c218b] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                onClick={() => window.scrollTo(0, 0)}
                className="text-xs font-semibold text-slate-500 hover:text-[#5c218b] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookie-policy"
                onClick={() => window.scrollTo(0, 0)}
                className="text-xs font-semibold text-slate-500 hover:text-[#5c218b] transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}