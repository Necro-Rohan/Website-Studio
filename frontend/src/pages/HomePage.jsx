import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js'; 

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      let newLimit = 9;
      if (window.innerWidth < 768) {
        newLimit = 4; // Mobile
      } else if (window.innerWidth < 1024) {
        newLimit = 6; // Tablet
      } else {
        newLimit = 9; // Desktop
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

  const Navbar = () => (
    <nav className="fixed top-0 w-full z-50 bg-[#f7f9fb]/90 backdrop-blur-xl transition-all duration-300 border-b border-slate-200/50">
      <div className="flex justify-between items-center px-3 md:px-12 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-[#5c218b] tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5c218b] rounded-lg flex items-center justify-center">
            <img src="/InstaWeb-Labs-icon.svg" className="w-5 h-5 invert brightness-0" alt="Logo" />
          </div>
          Website Studio
        </Link>
        <div className="flex items-center gap-4">
          <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-[#5c218b] to-[#753ca5] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all">
            Start Building
          </a>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="bg-[#f7f9fb]/90 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-600/20 selection:text-blue-700">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-[#f7f9fb]/90 backdrop-blur-xl transition-all duration-300 border-b border-slate-200/50">
        <div className="mx-auto flex h-16 max-w-7xl py-4 items-center justify-between px-3 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-2xl font-black  tracking-tighter flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-[#3027e0] to-[#1f23e4] text-white rounded-lg shadow-sm">
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
            className="bg-gradient-to-br from-[#3027e0] to-[#1f23e4] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all"
          >
            Start Building
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-24 md:pt-32 pb-10 grow w-full">
        {/* Hero Section */}
        <section className="mb-20 max-w-3xl ">
          <h1
            className="text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight text-slate-900 mb-6 italic"
            style={{ fontFamily: "'Newsreader', serif" }}
          >
            Resource Center
          </h1>
          <p className="text-xl leading-relaxed text-slate-600 w-full">
            Expert insights, editorial guides, and technical deep-dives on
            building high-performance websites for the modern web.
          </p>
        </section>

        {/* Initial Load State (Only shows when completely empty) */}
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex flex-col h-full animate-pulse">
                <div className="aspect-16/10 bg-slate-200 rounded-xl mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-6 grow"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Soft Loading Wrapper to Dim the grid instead of destroying it */
          <div
            className={`transition-opacity duration-300 ${loading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
          >
            {/* Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {posts.map((post) => {
                return (
                  <Link
                    to={`/blog/${post.slug}`}
                    key={post._id}
                    className="group flex flex-col h-full"
                  >
                    {/* Image Wrapper */}
                    <div className="aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500 relative">
                      <img
                        src={post.coverImage}
                        alt={post.h1}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Meta Tags */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                        {post.category}
                      </span>
                      <span className="size-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {post.geography}
                      </span>
                    </div>

                    {/* Typography */}
                    <h2
                      className="text-2xl font-semibold leading-snug text-slate-900 mb-3 group-hover:text-blue-600 transition-colors"
                      style={{ fontFamily: "'Newsreader', serif" }}
                    >
                      {post.h1}
                    </h2>
                    <p className="text-[16px] text-slate-600 leading-relaxed line-clamp-2 mb-6 grow">
                      {post.metaDescription}
                    </p>

                    {/* Author/Date Row */}
                    <div className="mt-auto flex items-center gap-3 text-sm font-medium text-slate-500 border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                          W
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

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="mt-15 flex flex-col justify-center gap-8 border-t border-slate-100 pt-10">
                <div className="flex items-center justify-center gap-20">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="hidden sm:flex items-center gap-2.5 text-sm font-bold text-slate-900 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
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
                          className={`flex size-8 items-center justify-center rounded text-xs font-bold transition-colors ${
                            currentPage === number
                              ? "bg-blue-600 text-white shadow-sm"
                              : "hover:bg-slate-100 text-slate-600"
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
                    className="hidden sm:flex items-center gap-2.5 text-sm font-bold text-slate-900 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>

                <p className="text-sm text-slate-500 text-center">
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * itemsPerPage, totalPosts)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {totalPosts}
                  </span>{" "}
                  guides
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-10">
            <h2 className="text-xl font-bold text-slate-700 mb-2">
              No guides published yet
            </h2>
            <p className="text-slate-500 mb-6">
              Head over to the admin dashboard to generate your first SEO page.
            </p>
            <Link
              to="/admin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        )}
      </main>

      {/* Large Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-10 mt-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="flex size-8 items-center justify-center bg-blue-600 text-white rounded shadow-sm">
                  <img
                    src="/InstaWeb-Labs-icon.svg"
                    className="w-4 h-4 invert brightness-0"
                    alt="Logo"
                  />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Website Studio
                </span>
              </div>
              <p className="text-slate-500 max-w-sm text-[15px] leading-relaxed">
                Empowering local businesses with professional, high-performance
                web presence. Built for speed, optimized for growth.
              </p>
            </div>
            <div className="flex flex-row justify-around md:grid-cols-2 gap-24 lg:gap-46">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">
                  Resources
                </h4>
                <nav className="flex flex-col gap-4">
                  <a
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                    href="#"
                  >
                    Documentation
                  </a>
                  <a
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                    href="#"
                  >
                    Case Studies
                  </a>
                  <Link
                    to="/"
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    Blog
                  </Link>
                </nav>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">
                  Connect
                </h4>
                <nav className="flex flex-col gap-4">
                  <a
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                    href="#"
                  >
                    Twitter
                  </a>
                  <a
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                    href="#"
                  >
                    LinkedIn
                  </a>
                  <Link
                    to="#"
                    className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    Instagram
                  </Link>
                </nav>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-5 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} Website Studio | Smart Website
              Builder for Local Businesses
            </p>
            <div className="flex gap-6">
              <a
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
                href="#"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}