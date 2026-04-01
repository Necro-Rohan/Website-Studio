// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import BlogPost from '../models/BlogPost.model.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export const renderSeoBlogPage = async (req, res) => {
//   try {
//     const post = await BlogPost.findOne({ slug: req.params.slug });
    
//     const indexPath = path.resolve(__dirname, '../../../frontend/dist/index.html');
//     let htmlData = fs.readFileSync(indexPath, 'utf8');

//     if (post) {
//       const articleSchema = {
//         "@context": "https://schema.org",
//         "@type": "Article",
//         "headline": post.h1,
//         "description": post.metaDescription,
//         "author": {
//           "@type": "Organization",
//           "name": "Website Studio"
//         }
//       };

//       let faqSchemaHtml = "";
//       if (post.content && post.content.faqs && Array.isArray(post.content.faqs.questions) && post.content.faqs.questions.length > 0) {
//         const faqItems = post.content.faqs.questions.map(faq => ({
//           "@type": "Question",
//           "name": faq.question,
//           "acceptedAnswer": {
//             "@type": "Answer",
//             "text": faq.answer
//           }
//         }));

//         const faqSchema = {
//           "@context": "https://schema.org",
//           "@type": "FAQPage",
//           "mainEntity": faqItems
//         };
        
//         faqSchemaHtml = `<script type="application/ld+json">\n${JSON.stringify(faqSchema)}\n</script>`;
//       }

//       const seoTags = `
//         <title>${post.metaTitle}</title>
//         <meta name="description" content="${post.metaDescription}" />
//         <meta property="og:title" content="${post.metaTitle}" />
//         <meta property="og:description" content="${post.metaDescription}" />
//         <meta property="og:type" content="article" />
//         <script type="application/ld+json">
//           ${JSON.stringify(articleSchema)}
//         </script>
//         ${faqSchemaHtml}
//       `;

//       htmlData = htmlData
//         .replace(/<title>.*?<\/title>/, "")
//         .replace("</head>", `${seoTags}\n</head>`);
      
//       htmlData = htmlData.replace(
//         '<div id="root"></div>',
//         `<div id="root">
//           <div style="opacity: 0; position: absolute; z-index: -1;">
//             <h1>${post.h1}</h1>
//             <p>${post.metaDescription}</p>
//             ${post.content && post.content.faqs && Array.isArray(post.content.faqs.questions) ? post.content.faqs.questions.map(faq => `
//               <div>
//                 <h2>${faq.question}</h2>
//                 <p>${faq.answer}</p>
//               </div>
//             `).join('') : ''}
//           </div>
//         </div>`,
//       );
      
//       return res.status(200).send(htmlData);
        
//     } else {
//       htmlData = htmlData.replace(/<title>.*?<\/title>/, `<title>Post Not Found | Website Studio</title>`);
//       return res.status(404).send(htmlData);
//     }

//   } catch (err) {
//     console.error("SEO Injection Error:", err);
//     res.status(500).send("Server Error occurred while injecting SEO.");
//   }
// };

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import BlogPost from '../models/BlogPost.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// XSS HTML Sanitizer
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const renderSeoBlogPage = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).lean();
    
    const indexPath = path.resolve(__dirname, '../../../frontend/dist/index.html');
    let htmlData = fs.readFileSync(indexPath, 'utf8');

    if (post) {
      // Sanitization of Core Meta Data
      const safeTitle = escapeHtml(post.metaTitle);
      const safeDesc = escapeHtml(post.metaDescription);
      const safeH1 = escapeHtml(post.h1);
      
      // DYNAMIC BASE URL (Environment Safe)
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const baseUrl = `${protocol}://${req.get("host")}`;
      const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

      //Article Schema
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": safeH1,
        "description": safeDesc,
        "author": { "@type": "Organization", "name": "Websites.co.in" }
      };

      //FAQ Schema & Semantic HTML
      let faqSchemaHtml = "";
      let visibleFaqs = "";
      if (post.content?.faqs?.questions?.length > 0) {
        const faqItems = post.content.faqs.questions.map(faq => ({
          "@type": "Question",
          "name": escapeHtml(faq.question),
          "acceptedAnswer": { "@type": "Answer", "text": escapeHtml(faq.answer) }
        }));
        
        faqSchemaHtml = `<script type="application/ld+json">\n${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqItems })}\n</script>`;
        
        visibleFaqs = post.content.faqs.questions.map(faq => `
          <div class="faq-item">
            <h3>${escapeHtml(faq.question)}</h3>
            <p>${escapeHtml(faq.answer)}</p>
          </div>
        `).join('');
      }

      // Features Semantic HTML
      let visibleFeatures = "";
      if (post.content?.features?.list?.length > 0) {
        visibleFeatures = "<ul>" + post.content.features.list.map(f => `
          <li><strong>${escapeHtml(f.title)}:</strong> ${escapeHtml(f.description)}</li>
        `).join('') + "</ul>";
      }

      // the Meta Tags
      const metaTags = `
        <meta name="description" content="${safeDesc}" />
        <meta property="og:title" content="${safeTitle}" />
        <meta property="og:description" content="${safeDesc}" />
        <meta property="og:url" content="${canonicalUrl}" />
        <meta property="og:type" content="article" />
      `;

      //the Visible SSR Content Block (With Semantic <section> Tags)
      const ssrContent = `
        <article id="seo-content" style="display: block;">
          <header>
            <h1>${safeH1}</h1>
            <p>${safeDesc}</p>
            ${post.content?.hero?.paragraphs ? `<p>${escapeHtml(post.content.hero.paragraphs)}</p>` : ''}
          </header>
          
          ${visibleFeatures ? `
          <section aria-labelledby="features-heading">
            <h2 id="features-heading">Core Features</h2>
            ${visibleFeatures}
          </section>
          ` : ''}
          
          ${visibleFaqs ? `
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading">Frequently Asked Questions</h2>
            ${visibleFaqs}
          </section>
          ` : ''}
        </article>
      `;

      // JSON ESCAPING FIX (Prevents </script> XSS breakage)
      const safeJson = JSON.stringify(post).replace(/</g, '\\u003c');
      const hydrationData = `<script>window.__INITIAL_BLOG_DATA__ = ${safeJson};</script>`;

      //DETERMINISTIC REPLACEMENTS
      htmlData = htmlData
        .replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
        .replace(/<meta name="description" content=".*?" \/>/, metaTags)
        
        // Inject into specific comment placeholders
        .replace('<!--SEO_CANONICAL-->', `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace('<!--SEO_SCHEMA-->', `<script type="application/ld+json">${JSON.stringify(articleSchema).replace(/</g, '\\u003c')}</script>\n${faqSchemaHtml}`)
        .replace('<!--SEO_SSR_CONTENT-->', ssrContent)
        .replace('<!--SEO_HYDRATION_DATA-->', hydrationData);

      htmlData = htmlData.replace(/<title>Vite \+ React<\/title>/i, "");

      return res.status(200).send(htmlData);
        
    } else {
      // 404 HANDLING FIX
      htmlData = htmlData.replace(/<title>.*?<\/title>/, `<title>Post Not Found | Websites.co.in</title>`);
      return res.status(404).send(htmlData);
    }

  } catch (err) {
    console.error("SEO Injection Error:", err);
    res.status(500).send("Server Error occurred while injecting SEO.");
  }
};