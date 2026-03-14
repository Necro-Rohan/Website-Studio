import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
  tls: { rejectUnauthorized: false },
});

async function clearQueue() {
  await redis.flushall();
  console.log("🔥 Upstash Database completely flushed!");
  process.exit(0);
}

clearQueue();
