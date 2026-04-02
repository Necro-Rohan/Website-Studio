import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api.js";
import { AlertTriangle, Home } from "lucide-react";

import {
  Navbar, Footer, HeroSection, IntroSection, TrendsSection,
  CostOfInactionSection, FeaturesSection, CaseStudiesSection,
  CompetitorSection, BenefitsSection, LocalSeoSection,
  FaqSection, FinalCta, HowItWorksSection, LocalImplementationSection, RealWorldScenariosSection, RelatedPostsSection
} from "../components/blogpage/BlogSections.jsx";

export default function BlogPage() {
  const { slug } = useParams();

  const initialData =
    window.__INITIAL_BLOG_DATA__?.slug === slug
      ? window.__INITIAL_BLOG_DATA__
      : null;

  // SSR HYDRATION STATE
  const [post, setPost] = useState(initialData);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!initialData);

  // DATA FETCHING LOGIC
  useEffect(() => {
    // To Automatically scroll to the top when a user clicks a related link!
    window.scrollTo(0, 0);

    if (!post || post.slug !== slug) {
      setLoading(true);
      api
        .get(`/blog/${slug}`)
        .then((res) => {
          setPost(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }

    return () => {
      window.__INITIAL_BLOG_DATA__ = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // METADATA UPDATE LOGIC
  useEffect(() => {
    if (post) {
      document.title = post.metaTitle || post.h1;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = post.metaDescription;
    }
  }, [post]);

  // LOADING & ERROR STATES
  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-6">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-[#191c1e] mb-4 tracking-tight">
            Post Not Found
          </h1>
          <p className="text-[#4a4455] text-lg mb-8 leading-relaxed">
            We couldn't find the guide you're looking for. It may have been
            moved, deleted, or the URL might be incorrect.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#5c218b] text-white rounded-full font-bold text-lg hover:bg-[#4a1a70] transition-colors gap-2 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !post) return (
    <div className="min-h-screen bg-[#f7f9fb] overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 animate-pulse">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-lg bg-slate-200"></div>
            <div className="w-32 h-6 rounded-md bg-slate-200 hidden sm:block"></div>
          </div>
          <div className="w-28 h-10 rounded-lg bg-slate-200"></div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto animate-pulse">
        {/* Breadcrumbs */}
        <div className="w-48 h-4 bg-slate-200 rounded-full mb-8"></div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Text Column */}
          <div>
            <div className="space-y-4 mb-8">
              <div className="h-12 sm:h-16 bg-slate-200 rounded-xl w-full"></div>
              <div className="h-12 sm:h-16 bg-slate-200 rounded-xl w-5/6"></div>
              <div className="h-12 sm:h-16 bg-slate-200 rounded-xl w-2/3"></div>
            </div>
            <div className="space-y-3 mb-10">
              <div className="h-5 bg-slate-200 rounded-full w-full"></div>
              <div className="h-5 bg-slate-200 rounded-full w-11/12"></div>
              <div className="h-5 bg-slate-200 rounded-full w-4/5"></div>
            </div>
            {/* Author Block */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded-full w-32"></div>
                <div className="h-3 bg-slate-200 rounded-full w-48"></div>
              </div>
            </div>
          </div>
          
          {/* Right Image Column */}
          <div className="hidden lg:block">
            <div className="w-full aspect-square bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>

      <div className="py-24 px-6 bg-white border-y border-slate-100 animate-pulse">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="h-10 bg-slate-200 rounded-xl w-3/4 mb-8"></div>
            <div className="h-5 bg-slate-200 rounded-full w-full"></div>
            <div className="h-5 bg-slate-200 rounded-full w-full"></div>
            <div className="h-5 bg-slate-200 rounded-full w-5/6 mb-6"></div>
            <div className="h-4 bg-slate-200 rounded-full w-full"></div>
            <div className="h-4 bg-slate-200 rounded-full w-4/5"></div>
          </div>
          
          {/* Right Callout Box */}
          <div className="lg:col-start-9 lg:col-span-4 hidden lg:block">
            <div className="bg-slate-100 h-64 rounded-3xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const content = post.content;
  const images = post.images || [];

  // Checking for old blogs
  const isLegacyPost = !content || !content.introduction;

  // Old Blogs
  if (isLegacyPost) {
    const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div className="bg-[#f6f6f8] text-slate-900 font-sans antialiased min-h-screen overflow-x-hidden">
        {/* Legacy Header */}
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
                  Website Studio
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

          {/* Legacy Hero */}
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

          {/* Legacy HTML Content */}
          <div className="flex justify-center">
            <article
              className="prose prose-base sm:prose-lg sm:prose-xl prose-slate max-w-full mx-auto wrap-break-words
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

          {/* Legacy Footer CTA */}
          <div className="mt-20 rounded-3xl bg-slate-900 p-10 text-center text-white sm:p-16 shadow-2xl relative overflow-hidden">
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
                href="https://websites.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-blue-500 hover:scale-105 hover:shadow-blue-500/30 transition-all duration-300 shadow-lg text-lg"
              >
                Start Your Free Trial
              </a>
            </div>
          </div>
        </main>

        {/* Legacy Footer */}
        <footer className="border-t border-slate-200 bg-slate-50 py-12 mt-12 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} Website Studio | Smart Website Builder
            for Local Businesses. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans antialiased min-h-screen overflow-x-hidden selection:bg-[#753ca5] selection:text-white">
      <Navbar />
      <main>
        <HeroSection content={content.hero} post={post} image={images[0]} />
        <IntroSection content={content.introduction} />
        <TrendsSection content={content.industryTrends} image={images[1]} />
        <CostOfInactionSection
          content={content.theCostOfInaction}
          image={images[2]}
        />
        <FeaturesSection content={content.features} />
        {content.caseStudies ? (
          <CaseStudiesSection content={content.caseStudies} images={images} />
        ) : (
          <>
            <LocalImplementationSection content={content.localImplementation} />
            <RealWorldScenariosSection content={content.realWorldScenarios} />
          </>
        )}
        <CompetitorSection content={content.competitorComparison} />
        <BenefitsSection
          content={content.whyChooseUs}
          image={images[2] || images[0]}
        />
        <HowItWorksSection content={content.howItWorks} />
        <LocalSeoSection content={content.localSeoGuide} />
        <FaqSection content={content.faqs} />
        <RelatedPostsSection links={post.internalLinks} />
        <FinalCta post={post} />
      </main>
      <Footer />
    </div>
  );
}