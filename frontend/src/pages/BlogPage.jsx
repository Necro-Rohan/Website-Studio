import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api.js";

export default function BlogPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetching the blog data from your new GET route
    api
      .get(`/blog/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => setError(true));
  }, [slug]);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post Not Found</h1>
          <Link
            stroke="currentColor"
            to="/admin"
            className="text-blue-600 underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse">
        <p className="text-slate-500 font-medium">Loading SEO Content...</p>
      </div>
    );

  return (
    <div className="bg-white text-slate-900 font-sans antialiased min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1 rounded">
              <span className="block w-5 h-5 bg-white rounded-sm"></span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              websites.co.in
            </span>
          </div>
          <a
            href="https://websites.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700 transition inline-block"
          >
            Get Started
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-900">Blog</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-10 border-b border-slate-200 pb-10">
          <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
            {post.h1}
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                W
              </div>
              <span className="font-semibold text-slate-900">
                Websites Team
              </span>
            </div>
            <span>•</span>
            <span>Updated {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        {/* Dynamic Blog Content */}
        {/* i used 'prose' from @tailwindcss/typography to automatically style the AI-generated HTML */}
        <article
          className="prose prose-lg prose-slate max-w-none 
          prose-headings:text-slate-900 prose-headings:font-bold 
          prose-p:leading-relaxed prose-p:text-slate-700
          prose-a:text-white prose-a:no-underline 
          prose-strong:text-slate-900 prose-strong:font-semibold"
        >
          <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
        </article>

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl bg-slate-900 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold mb-4">
            Ready to launch your {post.category} website?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join thousands of businesses in {post.geography} growing their
            online presence with Websites.co.in.
          </p>
          <a
            target="_blank"
            href="https://websites.co.in"
            className="inline-block bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Start Your Free Trial
          </a>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-12 mt-12 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} websites.co.in. All rights reserved.</p>
      </footer>
    </div>
  );
}