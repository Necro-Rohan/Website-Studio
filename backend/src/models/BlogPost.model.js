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
    coverImage: { type: String },
    images: { type: [mongoose.Schema.Types.Mixed], default: [] }, // for all imges
    batchId: { type: String, index: true }, // to group related posts together during generation

    // THE NEW JSON OBJECT
    content: { type: Object, default: {} },

    // THE OLD HTML STRING (Keping for backward compatibility!)
    htmlContent: { type: String },

    // Admin tracking
    status: {
      type: String,
      enum: ["published", "queued", "generating", "failed"],
      default: "published",
    },

    internalLinks: {
      sameCategory: [
        {
          slug: { type: String },
          h1: { type: String },
          thumbnail: { type: String },
        },
      ],
      sameGeography: [
        {
          slug: { type: String },
          h1: { type: String },
          thumbnail: { type: String },
        },
      ],
      crossCategory: [
        {
          slug: { type: String },
          h1: { type: String },
          thumbnail: { type: String },
        },
      ],
    },
    categorySlug: { type: String, index: true },
    geographySlug: { type: String, index: true },
  },
  { timestamps: true },
);

// TO FIX THE SORTING CRASH 
BlogPostSchema.index({ createdAt: -1 });

//Compound index to instantly find related blogs by location/category
BlogPostSchema.index({ geography: 1, category: 1 });

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
export default BlogPost;