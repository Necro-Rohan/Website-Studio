import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema(
  {
    // The Variables
    adjective: { type: String, required: true },
    category: { type: String, required: true },
    geography: { type: String, required: true },

    // The SEO Outputs
    slug: { type: String, required: true, unique: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    h1: { type: String, required: true },
    htmlContent: { type: String },

    coverImage: { type: String },

    // Admin tracking
    status: {
      type: String,
      enum: ["published", "generating", "failed"],
      default: "published",
    },
  },
  { timestamps: true },
);

// TO FIX THE SORTING CRASH 
BlogPostSchema.index({ createdAt: -1 });

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
export default BlogPost;