import { Worker } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import BlogPost from '../models/BlogPost.model.js';
import { generateSEOContentPipeline } from '../services/aiService.js'; 
import connectDb from '../../db.js';

dotenv.config();

connectDb();

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: { rejectUnauthorized: false }
});

console.log("Blog Worker is running and waiting for jobs...");

const worker = new Worker(
  "blog-generation-queue",
  async (job) => {
    const { keyword, category, geography, adjective } = job.data;
    console.log(`Processing Job ${job.id} for: ${keyword}`);

    try {
      // entire Master AI Pipeline
      const generatedData = await generateSEOContentPipeline(
        adjective,
        category,
        geography,
      );

      const imgMatch = generatedData.htmlContent.match(
        /<img[^>]+src="([^">]+)"/,
      );
      const coverImage = imgMatch
        ? imgMatch[1]
        : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80";

      // Save to MongoDB using the AI-generated SEO Data
      const newBlog = new BlogPost({
        adjective,
        category,
        geography,
        slug: generatedData.slug,
        metaTitle: generatedData.metaTitle,
        metaDescription: generatedData.metaDescription,
        h1: generatedData.h1,
        htmlContent: generatedData.htmlContent,
        coverImage: coverImage,
        status: "published",
      });

      await newBlog.save();
      console.log(`Job ${job.id} successfully completed and saved to DB!`);

      return { success: true, slug: newBlog.slug };
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error.message);

      await BlogPost.findOneAndUpdate({ slug }, { status: "failed" });
      
      throw error; // This triggers the BullMQ retry logic
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Process up to 1 blog simultaneously!
    limiter: {
      max: 10, // Maximum number of jobs processed
      duration: 3600000, // Per duration in milliseconds (60,000ms = 1 minute)
    },
  },
);

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has permanently failed after retries with error ${err.message}`);
});