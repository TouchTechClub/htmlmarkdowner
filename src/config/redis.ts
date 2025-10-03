import { createClient } from "redis";

// Redis client setup
const redisClient = createClient({
	url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis
await redisClient.connect();

export default redisClient;
