import { Worker } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import BlogPost from '../models/BlogPost.model.js';
import { generateSEOContentPipeline } from '../services/aiService.js'; 
import connectDb from '../../db.js';

dotenv.config();

connectDb();

const redisConnection = new Redis(process.env.RENDER_REDIS_URL, {
  maxRetriesPerRequest: null,
});

console.log("Blog Worker is running and waiting for jobs...");

const worker = new Worker(
  "blog-generation-queue-test",
  async (job) => {
    const { keyword, category, geography, adjective } = job.data;
    const slug = job.id;
    console.log(`Processing Job ${job.id} for: ${keyword}`);

    try {
      // entire Master AI Pipeline
      const generatedData = await generateSEOContentPipeline(
        adjective,
        category,
        geography,
      );

      let coverImage =
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"; // Default fallback

      if (generatedData.images && generatedData.images.length > 0) {
        coverImage =
          typeof generatedData.images[0] === "object"
            ? generatedData.images[0].url
            : generatedData.images[0];
      }

      // const sanitizedImages = generatedData.images.map((img) => {
      //   return typeof img === "string" ? img : img.url;
      // });
      // Save to DB
      await BlogPost.findOneAndUpdate(
        { slug: slug },
        {
          $set: {
            metaTitle: generatedData.metaTitle,
            metaDescription: generatedData.metaDescription,
            h1: generatedData.h1,
            content: generatedData.content,
            images: generatedData.images,
            coverImage: coverImage,
            status: "published", // Turn the yellow badge green!
          },
        },
        { returnDocument: "after" },
      );

      console.log(`Job ${job.id} successfully completed and updated in DB!`);

      return { success: true, slug: slug };
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error.message);

      await BlogPost.findOneAndUpdate(
        { slug: job.id },
        { $set: { status: "failed" } },
      );

      throw error; // This triggers the BullMQ retry logic
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    limiter: {
      max: 40,
      duration: 3600000, // 1 hour
    },
    lockDuration: 300000, // Telling BullMQ this job might take up to 5 minutes
    stalledInterval: 300000, // Don't check for stalled jobs for 5 minutes
    maxStalledCount: 1, // If it stalls, try it 1 more time before failing
  },
);

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has permanently failed after retries with error ${err.message}`);
});

worker.on('stalled', (jobId) => {
  console.warn(`Job ${jobId} STALLED! The AI is taking longer than expected.`);
});

worker.on("error", (err) => {
  console.error(`Fatal Worker Error:`, err);
});