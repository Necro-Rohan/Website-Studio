import BlogPost from "../models/BlogPost.model.js";
import { generateSEOContent } from "../services/aiService.js";

export const BlogGenerator = async (req, res) => {
  const { adjective, category, geography } = req.body;

  if (!adjective || !category || !geography) {
    return res.status(400).json({ error: 'Missing required variables' });
  }

  const slug = `${adjective}-website-builder-for-${category}-in-${geography}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return res.status(409).json({ error: 'Post for this combination already exists.', slug });
    }

    console.log(`Generating content via Gemini for: ${slug}...`);
    const aiData = await generateSEOContent(adjective, category, geography);

    const newPost = new BlogPost({
      adjective, category, geography, slug,
      metaTitle: aiData.metaTitle,
      metaDescription: aiData.metaDescription,
      h1: aiData.h1,
      htmlContent: aiData.htmlContent,
    });

    await newPost.save();
    res.status(201).json({ message: 'Blog generated successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
