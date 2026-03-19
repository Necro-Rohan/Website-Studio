import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api.js";

export default function BlogPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get(`/blog/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => setError(true));
  }, [slug]);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Post Not Found
          </h1>
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] animate-pulse">
        <p className="text-slate-500 font-medium">Loading SEO Content...</p>
      </div>
    );
  
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-[#f6f6f8] text-slate-900 font-sans antialiased min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center bg-blue-600 text-white rounded-lg shadow-sm group-hover:bg-blue-700 transition">
                <img
                  src="/InstaWeb-Labs-icon.svg"
                  className="w-5 h-5 invert brightness-0"
                  alt="Logo"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                InstaWeb Labs
              </span>
            </Link>
          </div>
          <a
            href="https://websites.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition inline-block shadow-md hover:shadow-lg"
          >
            Start Building
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 md:px-6 py-8 md:py-12">
        <nav className="mb-4 md:mb-6 flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link to="/" className="hover:text-blue-600 transition">
            {" "}
            Home{" "}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Blog</span>
        </nav>

        {/* Hero Section */}
        <header className="flex justify-start max-w-5xl">
          <div className="mb-0 border-b border-slate-200 pb-12">
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
              {post.h1}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  W
                </div>
                <span className="font-semibold text-slate-900">
                  Websites Team
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="font-medium">Updated {formattedDate}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Blog Content */}
        {/* i used 'prose' from @tailwindcss/typography to automatically style the AI-generated HTML */}
        <div className="flex justify-center">
          <article
            className="prose prose-base sm:prose-lg sm:prose-xl prose-slate max-w-full  mx-auto break-words
          prose-headings:text-slate-900 prose-headings:font-black prose-headings:leading-tight prose-headings:tracking-tight
          prose-p:leading-relaxed prose-p:text-slate-700
          prose-a:text-white prose-a:no-underline prose-a:font-semibold prose-a:px-1.5 prose-a:py-2 prose-a:rounded-lg transition
          prose-strong:text-slate-900 prose-strong:font-bold
          prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-slate-200 prose-img:w-full prose-img:object-cover
          prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-slate-800 prose-blockquote:not-italic prose-blockquote:shadow-sm prose-blockquote:font-medium
          prose-li:marker:text-blue-600
          prose-table:w-full prose-table:h-full prose-table:text-sm sm:prose-table:text-base prose-table:text-slate-700 prose-table:border-collapse prose-th:bg-slate-50 prose-th:p-3 sm:prose-th:p-4 prose-th:font-bold prose-td:p-3 sm:prose-td:p-4 prose-td:border-b prose-td:border-slate-200 prose-td:align-top"
          >
            <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
          </article>
        </div>

        {/* Footer CTA */}
        <div className="mt-20 rounded-3xl bg-slate-900 p-10 text-center text-white sm:p-16 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-6 tracking-tight">
              Ready to launch your {post.category} website?
            </h2>
            <p className="text-slate-300 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Join thousands of businesses in {post.geography} growing their
              online presence with Websites.co.in. Launch in 15 minutes.
            </p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://websites.co.in"
              className="inline-block bg-blue-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-blue-500 hover:scale-105 hover:shadow-blue-500/30 transition-all duration-300 shadow-lg text-lg"
            >
              Start Your Free Trial
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-12 mt-12 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Instaweb Labs. All rights reserved.</p>
        {/* <p>© 2026 Instaweb Labs. Built for Websites.co.in.</p> */}
      </footer>
    </div>
  );
}