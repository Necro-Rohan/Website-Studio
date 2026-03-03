import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js'; 

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  //paginations
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      let newLimit = 9;
      if (window.innerWidth < 768) {
        newLimit = 4;
        setItemsPerPage(4); // Mobile
      } else if (window.innerWidth < 1024) {
        newLimit = 6;
        setItemsPerPage(6); // Tablet
      } else {
        setItemsPerPage(9); // Desktop
      }
      setItemsPerPage((prevLimit) => {
        // If the limit changes, i am also reseting the page to 1
        // to avoid the "out of bounds" error natively!
        if (prevLimit !== newLimit) setCurrentPage(1);
        return newLimit;
      });
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
    
      api.get(`/blogs?page=${currentPage}&limit=${itemsPerPage}`)
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

  return (
    <div className="bg-[#f6f6f8] text-slate-900 font-sans antialiased min-h-screen flex flex-col">
      {/* Top Navigation Bar (Matching the BlogPage) */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src='/InstaWeb-Labs-icon.svg' className='w-8 h-8'/>
            <span className="text-xl font-black tracking-tight">InstaWeb Labs</span>
          </div>
          <a
            href="https://websites.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition inline-block shadow-md"
          >
            Get Started
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-16 grow w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">
            Local Business Growth Guides
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Discover the best digital tools and website builders tailored specifically for your industry and city.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                to={`/blog/${post.slug}`} 
                key={post._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.geography}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                  {post.h1}
                </h2>
                <p className="text-slate-500 text-sm grow line-clamp-3 mb-6">
                  {post.metaDescription}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-blue-600 font-semibold hover:underline">Read Article →</span>
                  <span className="text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-8">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, totalPosts)}</span> of <span className="font-semibold text-slate-900">{totalPosts}</span> guides
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  
                  <div className="hidden sm:flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition ${
                          currentPage === number
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700 mb-2">No guides published yet</h3>
            <p className="text-slate-500 mb-6">Head over to the admin dashboard to generate your first SEO page.</p>
            <Link to="/admin" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
              Go to Admin Dashboard
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-10 mt-auto text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Instaweb Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}