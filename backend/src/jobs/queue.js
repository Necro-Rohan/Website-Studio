import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();


const renderRedisUrl = process.env.RENDER_REDIS_URL;

const redisOptions = {
  maxRetriesPerRequest: null,
};

if (renderRedisUrl.startsWith("rediss://")) {
  redisOptions.tls = { rejectUnauthorized: false };
}

const redisConnection = new Redis(renderRedisUrl, redisOptions);


// the Queue
export const blogQueue = new Queue('blog-generation-queue-test', { 
  connection: redisConnection 
});

// add jobs to the queue
export async function addBlogQueue(blogData, uniqueBlogId) {
  const job = await blogQueue.add("generate-blog", blogData, {
    jobId: uniqueBlogId, // Ensuring uniqueness to prevent duplicates
    removeOnComplete: true, 
    removeOnFail: 100, // only the last 100 failed jobs for debugging
    attempts: 3,
    timeout: 300000,
    backoff: {
      type: "exponential",
      delay: 30000, // Wait 30 seconds before retrying
    },
  });
  
  console.log(`Job added to queue! Job ID: ${job.id}`);
  return job;
}