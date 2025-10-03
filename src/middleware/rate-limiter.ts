import { rateLimiter, type Store } from "hono-rate-limiter";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis";

// Rate limiter middleware with Redis
export const limiter = rateLimiter({
	windowMs: 60 * 1000, // 1 minute
	limit: 5, // Limit each IP to 5 requests per minute
	standardHeaders: "draft-7",
	keyGenerator: (c) => {
		// Get IP from various headers (for proxy support)
		return (
			c.req.header("cf-connecting-ip") ||
			c.req.header("x-forwarded-for")?.split(",")[0] ||
			c.req.header("x-real-ip") ||
			"unknown"
		);
	},
	store: new RedisStore({
		sendCommand: (...args: string[]) => redisClient.sendCommand(args),
	}) as unknown as Store,
});
