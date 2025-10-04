import { OpenAPIHono } from "@hono/zod-openapi";
import redisClient from "./config/redis";
import { routes } from "./routes/index";

const app = new OpenAPIHono();

// Mount routes
app.route("/", routes);

// Graceful shutdown
process.on("SIGINT", async () => {
	console.log("Shutting down gracefully...");
	await redisClient.quit();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("Shutting down gracefully...");
	await redisClient.quit();
	process.exit(0);
});

export default {
	hostname: process.env.HOSTNAME || "0.0.0.0",
	port: process.env.PORT || 3000,
	fetch: app.fetch,
};

console.log(
	`🔥 Server running on ${process.env.HOSTNAME || "0.0.0.0"}:${process.env.PORT || 3000}`,
);
