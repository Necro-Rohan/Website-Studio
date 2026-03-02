import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema({
  // The Variables
  adjective: { type: String, required: true },
  category: { type: String, required: true },
  geography: { type: String, required: true },
  
  // The SEO Outputs
  slug: { type: String, required: true, unique: true },
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  h1: { type: String, required: true },
  htmlContent: { type: String, required: true },
  
  // Admin tracking
  status: { type: String, enum: ['published', 'draft', 'failed'], default: 'published' }
}, { timestamps: true });

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
export default BlogPost;