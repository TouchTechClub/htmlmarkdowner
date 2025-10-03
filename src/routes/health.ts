import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import redisClient from "../config/redis";
import { HealthResponseSchema } from "../lib/validation";

export const healthRouter = new OpenAPIHono();

// Define the health check route
const healthRoute = createRoute({
	method: "get",
	path: "/health",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: HealthResponseSchema,
				},
			},
			description: "Service is healthy",
		},
		503: {
			content: {
				"application/json": {
					schema: HealthResponseSchema,
				},
			},
			description: "Service is unhealthy",
		},
	},
	tags: ["Health"],
	summary: "Health check",
	description: "Check the health status of the API and Redis connection",
});

// Implement the health check route
healthRouter.openapi(healthRoute, async (c) => {
	try {
		await redisClient.ping();
		return c.json({ status: "ok", redis: "connected" });
	} catch {
		return c.json({ status: "error", redis: "disconnected" }, 503);
	}
});
