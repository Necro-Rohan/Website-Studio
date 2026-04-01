import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, TrendingUp, AlertTriangle, Star, 
  Target, Shield, ChevronDown, Calendar, Image as ImageIcon, 
  Users, MapPin, List, Scissors, Wrench, Smartphone, Laptop, 
  MessageCircle, CreditCard, Clock, Globe, Award, Zap, Heart, 
  ShoppingCart, CheckCircle, XCircle, Trophy, Check, Minus, X, 
} from "lucide-react";

const getImgUrl = (img) => {
  if (!img) return "";
  return typeof img === 'object' ? img.url : img;
};

// Sleek Unsplash Attribution Overlay
const UnsplashBadge = ({ img }) => {
  if (typeof img !== 'object' || !img?.isUnsplash) return null;
  
  return (
    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white/90 text-[10px] px-3 py-1.5 rounded-full z-20 shadow-lg border border-white/10">
      Photo by{' '}
      <a href={`${img.photographerUrl}?utm_source=Website_Studio&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-white transition-colors">
        {img.photographerName}
      </a>
      {' '}on{' '}
      <a href="https://unsplash.com/?utm_source=Website_Studio&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-white transition-colors">
        Unsplash
      </a>
    </div>
  );
};

// LAYOUT COMPONENTS 
export const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-[#f7f9fb]/90 backdrop-blur-xl transition-all duration-300 border-b border-slate-200/50">
    <div className="flex justify-between items-center px-3 md:px-12 py-4 max-w-7xl mx-auto">
      <Link to="/" className="text-2xl font-black text-[#5c218b] tracking-tighter flex items-center gap-2">
        <div className="w-8 h-8 bg-[#5c218b] rounded-lg flex items-center justify-center">
          <img src="/InstaWeb-Labs-icon.svg" className="w-5 h-5 invert brightness-0" alt="Logo" />
        </div>
        Website Studio
      </Link>
      <div className="flex items-center gap-4">
        <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" className="bg-linear-to-br from-[#5c218b] to-[#753ca5] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all">
          Start Building
        </a>
      </div>
    </div>
  </nav>
);

export const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleBlogClick = (e) => {
    if (location.pathname === "/") {
      // for home page
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // If on Blog: Intercept the click!
      e.preventDefault();

      // for blog page
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/");
        window.scrollTo(0, 0);
      }, 500);
    }
  };
  return (
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
                onClick={(e) => handleBlogClick(e)}
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

        {/* Legal Bar */}
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

          {/* Legal Links */}
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
  );
};

export const FinalCta = ({ post }) => (
  <section className="px-6 max-w-5xl mx-auto mb-24">
    <div className="relative bg-[#191c1e] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-2xl border border-stone-800">
      {/* Subtle Purple Glow Effect for Sharpness */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5c218b] rounded-full filter blur-[100px] opacity-40 pointer-events-none"></div>

      {/* Text Content */}
      <div className="relative z-10 max-w-xl text-center md:text-left mb-8 md:mb-0">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
          Ready to dominate{" "}
          <span className="text-[#e0b6ff]">{post.geography}</span>? 
        </h2>
        <p className="text-stone-400 text-base md:text-lg font-medium">
          Join top-tier <b><i>{post.category.toLowerCase()}'s</i></b> scaling their
          business in the digital age.
        </p>
      </div>

      {/* Action Button */}
      <div className="relative z-10 shrink-0 w-full md:w-auto">
        <a
          href="https://websites.co.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full md:w-auto bg-white text-[#191c1e] px-8 py-4 rounded-full font-black text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(224,182,255,0.2)] transition-all duration-300 gap-2 group"
        >
          <Zap className="w-5 h-5 text-[#5c218b] group-hover:scale-110 transition-transform" />
          Start Building Free
        </a>
      </div>
    </div>
  </section>
);

// CONTENT COMPONENTS 
export const HeroSection = ({ content, post, image }) => (
  <header className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
    <div className="mb-8 flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-[#5c218b]">
      <Link to="/" >Home</Link>
      <ChevronDown className="w-4 h-4 -rotate-90" />
      <span>{post.category} Guide</span>
    </div>
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter text-[#191c1e] leading-[1.1] mb-8">
          {content.h1}
        </h1>
        <p
          className="text-xl text-[#4a4455] leading-relaxed mb-10 max-w-xl"
          dangerouslySetInnerHTML={{ __html: content.paragraphs }}
        ></p>
        <div className="flex items-center gap-4 p-1">
          <div className="w-12 h-12 rounded-full bg-[#dae2fd] flex items-center justify-center font-bold text-[#5c218b]">
            WS
          </div>
          <div>
            <div className="font-bold text-[#191c1e]">Website Studio Team</div>
            <div className="text-sm text-[#4a4455]">
              Updated {new Date(post.createdAt).toLocaleDateString()} • 8 min
              read
            </div>
          </div>
        </div>
      </div>
      {image && (
        <div className="relative group lg:block">
          <div className="absolute -inset-4 bg-[#5c218b]/10 rounded-3xl blur-2xl group-hover:bg-[#5c218b]/20 transition-colors duration-500"></div>
          {image && (
            <div className="relative group lg:block">
              <div className="absolute -inset-4 bg-[#5c218b]/10 rounded-3xl blur-2xl group-hover:bg-[#5c218b]/20 transition-colors duration-500"></div>
              {/* ADDED OVERFLOW HIDDEN AND BADGE */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img src={getImgUrl(image)} alt="Hero" className="w-full aspect-5/5 object-cover" loading="eager" fetchPriority="high"/>
                <UnsplashBadge img={image} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </header>
);

export const IntroSection = ({ content }) => (
  <section className="py-24 md:py-30 px-6 bg-white border-y border-slate-100">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-7 space-y-6">
        <h2 className="text-3xl font-black mb-8 text-[#191c1e] tracking-tight">{content.heading}</h2>
        <p className="text-xl leading-relaxed text-[#191c1e] font-medium" dangerouslySetInnerHTML={{ __html: content.paragraphs[0] }}></p>
        <p className="text-lg leading-relaxed text-[#4a4455]" dangerouslySetInnerHTML={{ __html: content.paragraphs[1] }}></p>
      </div>
      <div className="lg:col-start-9 lg:col-span-4">
        <div className="bg-[#f7f9fb] p-10 rounded-3xl border-l-4 border-[#5c218b] relative overflow-hidden shadow-sm">
          <Star className="text-[#5c218b]/10 w-32 h-32 absolute -right-4 -bottom-4 rotate-12" />
          <p className="text-xl font-bold text-[#5c218b] relative z-10 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.paragraphs[2] }}></p>
        </div>
      </div>
    </div>
  </section>
);

export const TrendsSection = ({ content, image }) => (
  <section className="py-15 md:py-20 px-6 max-w-7xl mx-auto">
    <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
      <div className="lg:w-1/2 space-y-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#5c218b]/10 text-[#5c218b] text-xs font-bold tracking-widest uppercase">Trend Report</div>
        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">{content.heading}</h2>
        <div className="space-y-8">
          {content.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-[#f2daff] flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-[#5c218b]" />
              </div>
              <p className="text-lg text-[#4a4455] leading-relaxed pt-2" dangerouslySetInnerHTML={{ __html: p }}></p>
            </div>
          ))}
        </div>
      </div>
      {image && (
        <div className="lg:w-1/2 relative group">
          <div className="absolute inset-0 bg-linear-to-tr from-[#5c218b]/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          {/* ADDED OVERFLOW HIDDEN AND BADGE */}
          <div className="relative overflow-hidden rounded-3xl shadow-xl border border-slate-100">
            <img src={getImgUrl(image)} alt="Trends" className="w-full" />
            <UnsplashBadge img={image} />
          </div>
        </div>
      )}
    </div>
  </section>
);

export const CostOfInactionSection = ({ content, image }) => (
  <section className="py-15 md:py-20 px-6 bg-[#191c1e] text-white">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
      <div>
        <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-8 leading-tight">{content.heading}</h2>
        <p className="text-xl text-white/70 leading-relaxed mb-10" dangerouslySetInnerHTML={{ __html: content.paragraphs[0] }}></p>
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-red-400 font-bold mb-4">
            <AlertTriangle className="w-6 h-6" /> The Risk of Inaction
          </div>
          <p className="text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.paragraphs[1] }}></p>
        </div>
      </div>
      {image && (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <img src={getImgUrl(image)} alt="Cost" className="w-full opacity-90 hover:opacity-100 transition-opacity duration-500" />
          <UnsplashBadge img={image} />
        </div>
      )}
    </div>
  </section>
);

export const FeaturesSection = ({ content }) => {
  //ICON DICTIONARY
  const getSmartIcon = (keyword) => {
    if (!keyword) return List;
    const kw = keyword.toLowerCase();
    
    if (kw.includes("calendar") || kw.includes("time") || kw.includes("clock") || kw.includes("book")) return Calendar;
    if (kw.includes("camera") || kw.includes("photo") || kw.includes("image") || kw.includes("gallery") || kw.includes("portfolio")) return ImageIcon;
    if (kw.includes("user") || kw.includes("people") || kw.includes("client") || kw.includes("customer")) return Users;
    if (kw.includes("map") || kw.includes("location") || kw.includes("pin") || kw.includes("geo")) return MapPin;
    if (kw.includes("scissor") || kw.includes("hair") || kw.includes("salon") || kw.includes("beauty")) return Scissors;
    if (kw.includes("wrench") || kw.includes("plumb") || kw.includes("tool") || kw.includes("repair") || kw.includes("fix")) return Wrench;
    if (kw.includes("shield") || kw.includes("secure") || kw.includes("safe") || kw.includes("trust")) return Shield;
    if (kw.includes("star") || kw.includes("review") || kw.includes("rate") || kw.includes("quality")) return Star;
    if (kw.includes("phone") || kw.includes("mobile") || kw.includes("app") || kw.includes("smart")) return Smartphone;
    if (kw.includes("message") || kw.includes("chat") || kw.includes("contact") || kw.includes("support")) return MessageCircle;
    if (kw.includes("pay") || kw.includes("card") || kw.includes("price") || kw.includes("cost") || kw.includes("money")) return CreditCard;
    if (kw.includes("shop") || kw.includes("cart") || kw.includes("store") || kw.includes("ecommerce")) return ShoppingCart;
    if (kw.includes("web") || kw.includes("globe") || kw.includes("online") || kw.includes("domain") || kw.includes("site")) return Globe;
    if (kw.includes("award") || kw.includes("cert") || kw.includes("best") || kw.includes("win")) return Award;
    if (kw.includes("fast") || kw.includes("quick") || kw.includes("speed") || kw.includes("zap") || kw.includes("instant")) return Zap;
    if (kw.includes("heart") || kw.includes("health") || kw.includes("care") || kw.includes("medical")) return Heart;

    
    return List; 
  };

  return (
    <section className="py-15 md:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black mb-16 text-center tracking-tight">{content.heading}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.list.map((feature, i) => {
            // Dynamically grab the best icon based on the AI's keyword
            const Icon = getSmartIcon(feature.iconKeyword);
            
            return (
              <div key={i} className="p-8 rounded-3xl bg-[#f7f9fb] hover:bg-[#dae2fd]/30 transition-all duration-300 group border border-transparent hover:border-[#dae2fd]">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-[#5c218b]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-[#191c1e]">{feature.title}</h3>
                <p className="text-[#4a4455] text-md leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }}></p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const CaseStudiesSection = ({ content, images }) => (
  <section className="py-15 md:py-20 px-6 bg-[#f7f9fb]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black mb-4 tracking-tight">{content.heading}</h2>
          <p className="text-[#4a4455] text-lg">See how local businesses are scaling with digital frameworks.</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {content.studies.slice(0, 2).map((study, i) => {
          const imgData = images[i === 0 ? 3 : 4] || images[0];
          const safeImgUrl = typeof imgData === 'object' ? imgData.url : imgData;
          
          return (
            <div key={i} className="relative rounded-3xl overflow-hidden bg-[#191c1e] group aspect-square md:aspect-square lg:aspect-auto lg:h-150">
              <img
                src={safeImgUrl}
                alt="Success Story"
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              />
            
              {/* The Text Overlay Container */}
              <div className="absolute inset-0 bg-linear-to-t from-[#191c1e] via-[#191c1e]/80 to-transparent flex items-center p-6 md:p-10 lg:p-12 hover:scale-105 transition-transform duration-700">
                <div className="w-full">
                  <div className="text-[#e0b6ff] text-xs font-bold mb-3 uppercase tracking-[0.2em]">Case Study</div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: study.businessProfile }}></h3>
                
                  {/* MOBILE VIEW  */}
                  <div className="block md:hidden">
                    <p className="text-white/90 text-sm leading-relaxed border-l-2 border-[#e0b6ff] pl-3" dangerouslySetInnerHTML={{ __html: study.mobileSummary || study.theResult }}></p>
                  </div>

                  {/* TABLET VIEW */}
                  <div className="hidden md:block lg:hidden">
                    <p className="text-white/90 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: study.tabletSummary || (study.theProblem + " " + study.theResult) }}></p>
                  </div>

                  {/* DESKTOP VIEW */}
                  <div className="hidden lg:block space-y-4">
                    <p className="text-white/80 text-sm"><strong className="text-white">Problem:</strong> <span dangerouslySetInnerHTML={{ __html: study.theProblem }}></span></p>
                    <p className="text-white/80 text-sm"><strong className="text-white">Solution:</strong> <span dangerouslySetInnerHTML={{ __html: study.theSolution }}></span></p>
                    <p className="text-[#e0b6ff] font-medium mt-4 border-l-2 border-[#e0b6ff] pl-4" dangerouslySetInnerHTML={{ __html: study.theResult }}></p>
                  </div>

                </div>
              </div>
            </div>
          ); 
        })} 
      </div>
    </div>
  </section>
);

// Local Implementation Section 
export const LocalImplementationSection = ({ content }) => {
  if (!content || !content.workflows) return null;
  
  return (
    <section className="py-12 md:py-18 px-6 bg-[#f7f9fb] border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="text-[#5c218b] text-sm font-bold mb-3 uppercase tracking-widest">
            Operational Workflows
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#191c1e]">
            {content.heading}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {content.workflows.map((workflow, i) => (
            <div
              key={i}
              className="bg-[#f7f9fb] p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                <span className="text-xl font-black text-[#5c218b]">
                  {i + 1}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-[#191c1e] mb-6">
                {workflow.workflowType}
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    The Requirement
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {workflow.theRequirement}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    The Execution
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {workflow.theExecution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Real World Scenarios Section 
export const RealWorldScenariosSection = ({ content }) => {
  if (!content || !content.scenarios) return null;

  return (
    <section className="py-15 md:py-24 px-6 bg-[#191c1e] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="text-[#e0b6ff] text-sm font-bold mb-3 uppercase tracking-widest">Real World Impact</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">{content.heading}</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {content.scenarios.map((scenario, i) => (
            <div key={i} className="bg-white/5 rounded-3xl p-8 md:p-10 border border-white/10 hover:border-white/20 transition-colors backdrop-blur-sm">
               
               {/* Situation */}
               <div className="mb-6 pb-6 border-b border-white/10">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 rounded-full bg-red-400"></div>
                   <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">The Situation</span>
                 </div>
                 <p className="text-slate-300 leading-relaxed">{scenario.situation}</p>
               </div>

               {/* Solution */}
               <div className="mb-6 pb-6 border-b border-white/10">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                   <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">The Solution</span>
                 </div>
                 <p className="text-slate-300 leading-relaxed">{scenario.solution}</p>
               </div>

               {/* Outcome */}
               <div>
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 rounded-full bg-[#e0b6ff]"></div>
                   <span className="text-[#e0b6ff] text-xs font-bold uppercase tracking-wider">The Outcome</span>
                 </div>
                 <p className="text-white font-medium leading-relaxed">{scenario.outcome}</p>
               </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


export const CompetitorSection = ({ content }) => {
  const comparisons = content?.comparisons
    ? [...content.comparisons].sort((a, b) => a.rank - b.rank)
    : [];

  if (comparisons.length === 0) return null;

  // SEO SCHEMA GENERATOR (Crucial for Top 10 lists to get Rich Snippets)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: content.heading,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: comparisons.length,
    itemListElement: comparisons.map((comp) => ({
      "@type": "ListItem",
      position: comp.rank,
      item: {
        "@type": "SoftwareApplication",
        name: comp.platformName,
      },
    })),
  };

  const renderList = (text, type, isRankOne) => {
    if (!text) return null;

    let listItems = [];
    if (Array.isArray(text)) {
      listItems = text.filter((item) => typeof item === "string" && item.trim() !== "");
    } else if (typeof text === "string") {
      listItems = text.split(/(?:\d+\.\s+|[•\-*]\s+)/).filter((item) => item.trim() !== "");
    } else return null;

    if (listItems.length === 0) return null;

    return (
      <ul className={`space-y-4 ${type === "bad" && isRankOne ? "opacity-80" : ""}`}>
        {listItems.map((item, idx) => {
          let IconComponent;
          let iconColor;

          if (type === "good") {
            IconComponent = Check;
            iconColor = "text-[#5c218b]";
          } else if (type === "bad" && isRankOne) {
            IconComponent = Minus;
            iconColor = "text-slate-400";
          } else {
            IconComponent = X;
            iconColor = "text-red-500";
          }

          return (
            <li key={idx} className="flex items-start gap-4">
              <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} strokeWidth={3} />
              <b>
                <p className="text-[#4a4455] leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: item.trim() }} />
              </b>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section className="py-16 md:py-24 px-6 bg-[#f7f9fb]/50 overflow-x-hidden border-y border-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-black text-center mb-16 tracking-tight text-[#191c1e]">
          {content.heading}
        </h2>

        <div className="space-y-12">
          {comparisons.map((comp) => {
            const isRankOne = comp.rank === 1;

            return (
              <div 
                key={comp.rank} 
                className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
                  isRankOne 
                    ? "border-2 border-[#5c218b] shadow-2xl shadow-purple-900/10 ring-8 ring-[#e0b6ff]/20" 
                    : "border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Header Strip */}
                <div className={`px-8 py-6 border-b ${isRankOne ? "bg-[#5c218b] text-white" : "bg-slate-50 border-slate-200 text-[#191c1e]"}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-xl shadow-sm shrink-0 ${
                        isRankOne ? "bg-[#e0b6ff] text-[#5c218b]" : "bg-white text-slate-500 border border-slate-200"
                      }`}>
                        #{comp.rank}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                        {comp.platformName}
                        {isRankOne && <Trophy className="w-6 h-6 text-[#ffb6ff]" />}
                      </h3>
                    </div>
                    {isRankOne && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-widest border border-white/20 backdrop-blur-sm">
                        <Star className="w-3.5 h-3.5 fill-current" /> Editor's Choice
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 lg:p-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    {/* The Good */}
                    <div>
                      <h4 className="text-lg font-black mb-6 flex items-center gap-2 text-[#191c1e]">
                        <CheckCircle className="text-[#5c218b] w-6 h-6" /> The Good
                      </h4>
                      {renderList(comp.theGood, "good", isRankOne)}
                    </div>
                    
                    {/* The Bad */}
                    <div className={isRankOne ? "opacity-80" : ""}>
                      <h4 className={`text-lg font-black mb-6 flex items-center gap-2 ${isRankOne ? "text-[#4a4455]" : "text-red-500"}`}>
                        <XCircle className="w-6 h-6" /> The Bad
                      </h4>
                      {renderList(comp.theBad, "bad", isRankOne)}
                    </div>
                  </div>

                  {/* Rank 1 CTA Button - ONLY shows for Websites.co.in */}
                  {isRankOne && (
                    <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                      <a 
                        href="https://websites.co.in" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center w-full md:w-auto px-10 py-4 bg-gradient-to-r from-[#5c218b] to-[#753ca5] text-white rounded-full font-black text-lg shadow-xl shadow-purple-900/20 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 gap-2 group"
                      >
                        Start Building Free
                        <Zap className="w-5 h-5 text-[#ffb6ff] group-hover:scale-110 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const HowItWorksSection = ({ content }) => {
  if (!content || !content.steps || content.steps.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-6 bg-[#f7f9fb] border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="text-sm font-black uppercase tracking-widest text-[#5c218b] mb-4 block">
            Quick Setup
          </span>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-[#191c1e]">
            {content.heading}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative">
          {/* Connecting line behind the numbers (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent -z-10"></div>

          {content.steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Number Badge */}
              <div className="w-24 h-24 rounded-full bg-[#f7f9fb] border-[6px] border-[#f7f9fb] flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_0_1px_rgba(203,213,225,1)]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-sm">
                  <span className="text-3xl font-black text-[#5c218b]">
                    {step.stepNumber}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-xl lg:text-2xl font-black text-[#191c1e] mb-4 leading-tight">
                {step.title}
              </h3>
              <p
                className="text-[#4a4455] leading-relaxed text-[15px] md:text-base font-medium"
                dangerouslySetInnerHTML={{ __html: step.description }}
              ></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BenefitsSection = ({ content, image }) => (
  <section className="py-15 md:py-20 px-6 bg-white border-t border-slate-100">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
      <div className="order-2 lg:order-1 relative">
         <div className="absolute -inset-4 bg-[#dae2fd] rounded-3xl blur-2xl"></div>
         {/* ADDED OVERFLOW HIDDEN AND BADGE */}
         <div className="relative overflow-hidden rounded-3xl shadow-2xl aspect-square">
           <img src={getImgUrl(image)} alt="Benefits" className="w-full h-full object-cover" />
           <UnsplashBadge img={image} />
         </div>
      </div>
      <div className="order-1 lg:order-2 space-y-12">
        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">{content.heading}</h2>
        <div className="space-y-6">
          {content.paragraphs.map((p, i) => (
            <p key={i} className="text-lg text-[#4a4455] leading-relaxed" dangerouslySetInnerHTML={{ __html: p }}></p>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-6 pt-6">
          {content.platformBenefits.map((benefit, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#f2daff] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#5c218b] shrink-0 justify-content" />
              </div>
              <div>
                <h4 className="font-bold text-md text-[#191c1e] mb-1">{benefit.benefitName}</h4>
                <p className="text-md text-[#4a4455] leading-relaxed" dangerouslySetInnerHTML={{ __html: benefit.benefitDetail }}></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const LocalSeoSection = ({ content }) => (
  <section className="py-15 md:py-20 px-6 max-w-7xl mx-auto">
    <div className="bg-[#5c218b] text-white rounded-3xl overflow-hidden grid lg:grid-cols-20 items-stretch shadow-2xl">
      <div className="lg:col-span-13 p-12 lg:p-20 space-y-8 z-10">
        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">{content.heading}</h2>
        <div className="space-y-6 text-[#e5c1ff]">
          {content.paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: p }}></p>
          ))}
        </div>
      </div>
      <div className="lg:col-span-7 relative min-h-100">
         <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" alt="Local SEO Map" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
         <div className="absolute inset-0 bg-linear-to-r from-[#5c218b] to-transparent"></div>
      </div>
    </div>
  </section>
);

export const FaqSection = ({ content }) => {
  const [openIndex, setOpenIndex] = useState(0);
  
  return (
    <section className="py-15 md:py-20 px-6 max-w-4xl mx-auto">
      <h2 className="text-4xl font-black text-center mb-16 tracking-tight">
        {content.heading}
      </h2>
      <div className="space-y-4">
        {content.questions.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:border-slate-300"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full text-left px-8 py-4 flex justify-between items-center focus:outline-none"
            >
              <span className="font-bold text-lg text-[#191c1e] pr-8">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-6 h-6 text-slate-400 shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180 text-[#5c218b]" : ""}`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openIndex === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className="px-8 pb-8 font-medium text-md md:text-lg text-[#4a4455] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-10 border-t border-slate-200 text-center flex flex-col items-center animate-fade-in">
        <h3 className="text-2xl md:text-3xl font-black text-[#191c1e] mb-4 tracking-tight">
          Have more questions?
        </h3>
        <p className="text-lg text-[#4a4455] font-medium mb-8 max-w-2xl">
          Ask directly with our Rank #1 recommendation and launch your digital
          presence today.
        </p>

        <a
          href="https://websites.co.in/faq"
          target="_blank"
          rel="noopener noreferrer"
          title="Ask Websites.co.in directly"
          className="inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-[#5c218b] to-[#753ca5] text-white rounded-full font-black text-lg shadow-xl shadow-purple-900/20 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 gap-3 group"
        >
          <MessageCircle className="w-6 h-6 text-[#ffb6ff] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
          Ask Websites.co.in
        </a>
      </div>
    </section>
  );
};