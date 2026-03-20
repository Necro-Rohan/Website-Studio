import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import BlogPost from '../models/BlogPost.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const renderSeoBlogPage = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    
    const indexPath = path.resolve(__dirname, '../../../frontend/dist/index.html');
    let htmlData = fs.readFileSync(indexPath, 'utf8');

    if (post) {
      // a comprehensive SEO block with Schema and Open Graph
      const seoTags = `
        <title>${post.metaTitle}</title>
        <meta name="description" content="${post.metaDescription}" />
        <meta property="og:title" content="${post.metaTitle}" />
        <meta property="og:description" content="${post.metaDescription}" />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "${post.h1}",
            "description": "${post.metaDescription}",
            "author": {
              "@type": "Organization",
              "name": "Website Studio"
            }
          }
        </script>
      `;

      // Strip out the default Vite title and inject the new block before </head>
      htmlData = htmlData
        .replace("<title>Website Studio | Smart Website Builder for Local Businesses</title>","")
        .replace("</head>", `${seoTags}\n</head>`);
      
      htmlData = htmlData.replace(
        '<div id="root"></div>',
        `<div id="root">
          <div style="opacity: 0; position: absolute; z-index: -1;">
            <h1>${post.h1}</h1>
            ${post.htmlContent}
          </div>
        </div>`,
      );
      return res.status(200).send(htmlData);
        
    } else {
      htmlData = htmlData.replace('<title>Website Studio | Smart Website Builder for Local Businesses</title>', `<title>Post Not Found | Website Studio</title>`);
      return res.status(404).send(htmlData);
    }

  } catch (err) {
    console.error("SEO Injection Error:", err);
    res.status(500).send("Server Error occurred while injecting SEO.");
  }
};