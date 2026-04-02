import BlogPost from "../models/BlogPost.model.js";
import { addBlogQueue } from "../jobs/queue.js";


export const BlogGenerator = async (req, res) => {
  const { blogs } = req.body; 

  if (!Array.isArray(blogs) || blogs.length === 0) {
    return res.status(400).json({ error: "Please provide an array of blogs to generate." });
  }
  if (blogs.length > 100) {
    return res.status(400).json({ error: "Strict Limit Exceeded: Maximum 100 blogs per batch to protect server memory." });
  }

  const results = {
    added: [],
    skipped: []
  };

  //  unique batch ID to group these requests together
  const batchId = `batch_${Date.now()}`;

  for (const item of blogs) {
    const { adjective, category, geography } = item;

    if (!adjective || !category || !geography) {
      results.skipped.push({ item, reason: "Missing variables" });
      continue;
    }

    const formattedAdjective = adjective.charAt(0).toUpperCase() + adjective.slice(1).toLowerCase();
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const formattedGeography = geography.charAt(0).toUpperCase() + geography.slice(1).toLowerCase();
    const keyword = `${formattedAdjective} Website Builder for ${formattedCategory} in ${formattedGeography}`;

    const checkSlug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    try {
      // DUPLICATE CHECK
      const existingPost = await BlogPost.findOne({ slug: checkSlug });
      if (existingPost) {
        results.skipped.push({ slug: checkSlug, reason: "Duplicate slug already exists" });
        continue; 
      }

      await BlogPost.create({
        slug: checkSlug,
        h1: `Generating SEO Page...`,
        category: formattedCategory,
        geography: formattedGeography,
        adjective: formattedAdjective,
        status: "queued", 
        batchId: batchId
      });

      console.log(`Adding job to queue for: ${checkSlug}...`);

      await addBlogQueue(
        {
          keyword,
          adjective: formattedAdjective,
          category: formattedCategory,
          geography: formattedGeography,
        },
        checkSlug,
      );

      results.added.push({ slug: checkSlug });
    } catch (error) {
      console.error(`Error processing ${checkSlug}:`, error);
      results.skipped.push({ slug: checkSlug, reason: "Database or Queue Error" });
    }
  }

  return res.status(202).json({
    message: "Bulk processing completed.",
    summary: {
      totalSubmitted: blogs.length,
      successCount: results.added.length,
      failedCount: results.skipped.length,
    },
    details: results
  });
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

export const getAllBlogPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .select("slug h1 metaDescription category geography createdAt coverImage status")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await BlogPost.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      currentPage: page,
      totalPages,
      totalPosts,
    });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body; // This might only contain { h1: "New Title" }

    // Only allowing specific fields to be edited
    const allowedUpdates = [
      "h1",
      "metaTitle",
      "metaDescription",
      "htmlContent",
    ];
    const filteredUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Check if there's actually anything to update
    if (Object.keys(filteredUpdates).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    // $set will cleanly update ONLY the fields present in filteredUpdates
    const updatedPost = await BlogPost.findOneAndUpdate(
      { slug },
      { $set: filteredUpdates },
      { new: true },
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    return res.status(200).json({
      message: "Blog patched successfully!",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error patching blog post:", error);
    res.status(500).json({ error: "Failed to update the blog post" });
  }
};

export const deleteBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const deletedPost = await BlogPost.findOneAndDelete({ slug });

    if (!deletedPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    return res.status(200).json({ message: "Blog deleted successfully!" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Failed to delete the blog post" });
  }
};