import BlogPost from "../models/BlogPost.model.js";

// the standard XML Sitemap for Google
export const generateSitemap = async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: "published" }).select(
      "slug updatedAt",
    );
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const baseUrl = `${protocol}://${req.get("host")}`;

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // the homepage/blog index
    sitemap += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // all generated blog posts
    posts.forEach((post) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      sitemap += `    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
};

// the llms.txt file for AI Crawlers (ChatGPT, Claude, Gemini)
export const generateLlmsTxt = async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: "published" }).select(
      "slug h1 metaDescription",
    );
   const protocol = req.headers["x-forwarded-proto"] || req.protocol;
   const baseUrl = `${protocol}://${req.get("host")}`;

    let llmsText = `# Website Studio Blog Directory\n\n`;
    llmsText += `This document provides a directory of our SEO-optimized guides for local businesses.\n\n`;
    llmsText += `## Available Guides:\n\n`;

    posts.forEach((post) => {
      llmsText += `- [${post.h1}](${baseUrl}/blog/${post.slug}): ${post.metaDescription}\n`;
    });

    res.header("Content-Type", "text/plain");
    res.send(llmsText);
  } catch (error) {
    console.error("llms.txt generation error:", error);
    res.status(500).send("Error generating llms.txt");
  }
};

export const generateRobotsTxt = (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const baseUrl = `${protocol}://${req.get("host")}`;

  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`;

  res.header("Content-Type", "text/plain");
  res.send(robotsTxt);
};