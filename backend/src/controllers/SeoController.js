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
      // 1. Build a comprehensive SEO block with Schema and Open Graph
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
              "name": "Websites.co.in"
            }
          }
        </script>
      `;

      // 2. Strip out the default Vite title and inject the new block before </head>
      htmlData = htmlData
        .replace('<title>frontend</title>', '') 
        .replace('</head>', `${seoTags}\n</head>`);
        
    } else {
      htmlData = htmlData.replace('<title>frontend</title>', `<title>Post Not Found - Websites.co.in</title>`);
    }

    res.send(htmlData);
  } catch (err) {
    console.error("SEO Injection Error:", err);
    res.status(500).send("Server Error occurred while injecting SEO.");
  }
};