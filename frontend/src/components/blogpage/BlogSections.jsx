import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, TrendingUp, AlertTriangle, Star, 
  Target, Shield, ChevronDown, Calendar, Image as ImageIcon, 
  Users, MapPin, List 
} from "lucide-react";

const getImgUrl = (img) => {
  if (!img) return "";
  return typeof img === 'object' ? img.url : img;
};

// Sleek Unsplash Attribution Overlay
const UnsplashBadge = ({ img }) => {
  // Only render if it's an object AND explicitly marked as Unsplash
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

// --- LAYOUT COMPONENTS ---
export const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-[#f7f9fb]/90 backdrop-blur-xl transition-all duration-300 border-b border-slate-200/50">
    <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
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

export const Footer = () => (
  <footer className="bg-[#eceef0]">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto py-12 px-8">
      <div className="font-black tracking-tight text-[#191c1e] flex items-center gap-2">
        <div className="w-6 h-6 bg-[#191c1e] rounded flex items-center justify-center">
          <img src="/InstaWeb-Labs-icon.svg" className="w-3 h-3 invert brightness-0" alt="Logo" />
        </div>
        Website Studio
      </div>
      <div className="text-[#4a4455] text-sm font-medium">© {new Date().getFullYear()} Website Studio. All rights reserved.</div>
    </div>
  </footer>
);

export const FinalCta = ({ post }) => (
  <section className="py-24 px-6 max-w-7xl mx-auto mb-20">
    <div className="bg-gradient-to-br from-[#5c218b] via-[#753ca5] to-[#9900ab] rounded-3xl p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none"></div>
      <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tighter max-w-4xl mx-auto leading-tight">Ready to Build Your Digital Atelier?</h2>
      <p className="text-xl text-[#e5c1ff] mb-12 max-w-2xl mx-auto font-medium">Join the elite network of {post.geography} {post.category.toLowerCase()}s defining the future in the digital age.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
        <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" className="bg-white text-[#5c218b] px-10 py-4 rounded-full font-black text-lg hover:bg-slate-50 transition-colors shadow-xl">
          Start Your Free Trial
        </a>
      </div>
    </div>
  </section>
);

// --- CONTENT COMPONENTS ---
export const HeroSection = ({ content, post, image }) => (
  <header className="pt-36 pb-20 px-6 max-w-7xl mx-auto">
    <div className="mb-8 flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-[#5c218b]">
      <Link to="/" >Home</Link>
      <ChevronDown className="w-4 h-4 -rotate-90" />
      <span>{post.category} Guide</span>
    </div>
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-[#191c1e] leading-[1.1] mb-8">
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
          {/* <img
            src={image}
            alt="Hero"
            className="relative w-full aspect-5/5 object-cover rounded-3xl shadow-2xl"
          /> */}
          {image && (
            <div className="relative group lg:block">
              <div className="absolute -inset-4 bg-[#5c218b]/10 rounded-3xl blur-2xl group-hover:bg-[#5c218b]/20 transition-colors duration-500"></div>
              {/* ADDED OVERFLOW HIDDEN AND BADGE */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img src={getImgUrl(image)} alt="Hero" className="w-full aspect-5/5 object-cover" />
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
  <section className="py-24 px-6 bg-white border-y border-slate-100">
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
  <section className="py-32 px-6 max-w-7xl mx-auto">
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
          <div className="absolute inset-0 bg-gradient-to-tr from-[#5c218b]/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
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
  <section className="py-32 px-6 bg-[#191c1e] text-white">
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

export const FeaturesSection = ({ content }) => (
  <section className="py-32 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl font-black mb-16 text-center tracking-tight">{content.heading}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {content.list.map((feature, i) => {
          const Icon = feature.iconKeyword.includes("calendar") ? Calendar 
                     : feature.iconKeyword.includes("camera") ? ImageIcon 
                     : feature.iconKeyword.includes("user") ? Users 
                     : feature.iconKeyword.includes("map") ? MapPin 
                     : List;
          return (
            <div key={i} className="p-8 rounded-3xl bg-[#f7f9fb] hover:bg-[#dae2fd]/30 transition-all duration-300 group border border-transparent hover:border-[#dae2fd]">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-[#5c218b]" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#191c1e]">{feature.title}</h3>
              <p className="text-[#4a4455] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }}></p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export const CaseStudiesSection = ({ content, images }) => (
  <section className="py-32 px-6 bg-[#f7f9fb]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black mb-4 tracking-tight">{content.heading}</h2>
          <p className="text-[#4a4455] text-lg">See how local businesses are scaling with digital frameworks.</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        {content.studies.map((study, i) => (
          <div key={i} className="relative rounded-3xl overflow-hidden bg-[#191c1e] group aspect-square lg:aspect-auto lg:h-[600px]">
            <img src={images[i === 0 ? 3 : 4] || images[0]} alt="Success Story" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e] via-[#191c1e]/60 to-transparent flex items-end p-8 md:p-12">
              <div>
                <div className="text-[#e0b6ff] text-xs font-bold mb-4 uppercase tracking-[0.2em]">Case Study</div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: study.businessProfile }}></h3>
                <div className="space-y-4">
                  <p className="text-white/80 text-sm"><strong className="text-white">Problem:</strong> <span dangerouslySetInnerHTML={{ __html: study.theProblem }}></span></p>
                  <p className="text-white/80 text-sm"><strong className="text-white">Solution:</strong> <span dangerouslySetInnerHTML={{ __html: study.theSolution }}></span></p>
                  <p className="text-[#e0b6ff] font-medium mt-4 border-l-2 border-[#e0b6ff] pl-4" dangerouslySetInnerHTML={{ __html: study.theResult }}></p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const CompetitorSection = ({ content }) => {
  const CompetitorCard = ({ comp, isMiddle }) => {
    const renderFormattedText = (text) => {
      if (!text) return null;
      const listItems = text.split(/(?:\d+\.\s+|[•\-*]\s+)/).filter(item => item.trim() !== '');
      const startsWithBullet = /^(?:\d+\.|[•\-*])\s/.test(text.trim());
  
      if (listItems.length > 1 || startsWithBullet) {
        return (
          <ul className="space-y-3 mt-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isMiddle ? 'bg-white' : 'bg-slate-400'}`}></div>
                <span className="text-sm leading-relaxed block" dangerouslySetInnerHTML={{ __html: item.trim() }} />
              </li>
            ))}
          </ul>
        );
      }
      return <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: text }}></p>;
    };
  
    return (
      <div className={`p-10 rounded-3xl transition-all duration-300 relative ${isMiddle ? 'bg-[#5c218b] text-white shadow-2xl scale-105 z-10' : 'bg-white border border-slate-200 hover:shadow-xl'}`}>
        {isMiddle && <div className="absolute -top-4 right-8 px-4 py-1 bg-[#e0b6ff] text-[#36003d] text-xs font-bold rounded-full">VS</div>}
        <h4 className={`text-2xl font-bold mb-8 ${isMiddle ? 'text-white' : 'text-slate-900'}`}>{comp.platformName}</h4>
        <div className="space-y-8">
          <div>
            <span className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isMiddle ? 'text-[#ffb6ff]' : 'text-red-500'}`}>
              <Target className="w-4 h-4" /> The Drawback
            </span>
            <div className={isMiddle ? 'text-white/90' : 'text-slate-600'}>{renderFormattedText(comp.biggestDrawback)}</div>
          </div>
          <div className={`pt-6 border-t ${isMiddle ? 'border-white/20' : 'border-slate-100'}`}>
            <span className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isMiddle ? 'text-[#e0b6ff]' : 'text-[#5c218b]'}`}>
              <Shield className="w-4 h-4" /> Our Advantage
            </span>
            <div className={isMiddle ? 'text-white font-medium' : 'text-slate-800 font-medium'}>{renderFormattedText(comp.ourAdvantage)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-black text-center mb-20 tracking-tight">{content.heading}</h2>
      <div className="grid lg:grid-cols-3 gap-8 items-center">
        {content.comparisons.map((comp, index) => (
          <CompetitorCard key={index} comp={comp} isMiddle={index === 1} />
        ))}
      </div>
    </section>
  );
};

export const BenefitsSection = ({ content, image }) => (
  <section className="py-32 px-6 bg-white border-t border-slate-100">
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
              <CheckCircle2 className="w-6 h-6 text-[#5c218b] shrink-0" />
              <div>
                <h4 className="font-bold text-[#191c1e] mb-1">{benefit.benefitName}</h4>
                <p className="text-sm text-[#4a4455] leading-relaxed" dangerouslySetInnerHTML={{ __html: benefit.benefitDetail }}></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const LocalSeoSection = ({ content }) => (
  <section className="py-32 px-6 max-w-7xl mx-auto">
    <div className="bg-[#5c218b] text-white rounded-3xl overflow-hidden grid lg:grid-cols-12 items-stretch shadow-2xl">
      <div className="lg:col-span-7 p-12 lg:p-20 space-y-8 z-10">
        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">{content.heading}</h2>
        <div className="space-y-6 text-[#e5c1ff]">
          {content.paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: p }}></p>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 relative min-h-[400px]">
         <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" alt="Local SEO Map" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#5c218b] to-transparent"></div>
      </div>
    </div>
  </section>
);

export const FaqSection = ({ content }) => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section className="py-32 px-6 max-w-4xl mx-auto">
      <h2 className="text-4xl font-black text-center mb-16 tracking-tight">{content.heading}</h2>
      <div className="space-y-4">
        {content.questions.map((faq, index) => (
          <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:border-slate-300">
            <button onClick={() => setOpenIndex(openIndex === index ? -1 : index)} className="w-full text-left px-8 py-6 flex justify-between items-center focus:outline-none">
              <span className="font-bold text-lg text-[#191c1e] pr-8">{faq.question}</span>
              <ChevronDown className={`w-6 h-6 text-slate-400 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#5c218b]' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-8 pb-8 text-[#4a4455] leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};