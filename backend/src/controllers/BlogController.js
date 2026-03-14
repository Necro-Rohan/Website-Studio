import BlogPost from "../models/BlogPost.model.js";
import { addBlogJob } from "../jobs/queue.js"; 

export const BlogGenerator = async (req, res) => {
  const { adjective, category, geography } = req.body;

  if (!adjective || !category || !geography) {
    return res.status(400).json({ error: "Missing required variables" });
  }

  const formattedAdjective = adjective.charAt(0).toUpperCase() + adjective.slice(1).toLowerCase();
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  const formattedGeography = geography.charAt(0).toUpperCase() + geography.slice(1).toLowerCase();
  const keyword = `${formattedAdjective} Website Builder for ${formattedCategory} in ${formattedGeography}`;
  
  const checkSlug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  try {
    // Check if it already exists 
    const existingPost = await BlogPost.findOne({ slug: checkSlug });
    if (existingPost) {
      return res.status(409).json({
        error: "Post for this combination already exists.",
        slug: checkSlug,
      });
    }

    console.log(`Adding multi-model SEO pipeline job to queue for: ${checkSlug}...`);

    // Tossing the data into the Redis Queue!
    const job = await addBlogJob({ 
      keyword, // Passing the full keyword to make the worker's life easier
      adjective, 
      category, 
      geography 
    }, checkSlug);

    // IMMEDIATELY sending a response back. No more waiting for the AI to do its thing!
    return res.status(202).json({ 
      message: "Blog generation started in the background!", 
      jobId: job.id 
    });

  } catch (error) {
    console.error("Generator Queue Error:", error);
    res.status(500).json({ error: "Failed to add job to queue" });
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

export const getAllBlogPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const skip = (page - 1) * limit;

    const posts = await BlogPost.find({ status: "published" })
      .select("-htmlContent")
      .sort({ createdAt: -1 })
      .select("slug h1 metaDescription category geography createdAt")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await BlogPost.countDocuments({ status: "published" });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};