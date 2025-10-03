import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { convertRouter } from "./convert";
import { healthRouter } from "./health";

export const routes = new OpenAPIHono();

// Mount all route modules
routes.route("/", convertRouter);
routes.route("/", healthRouter);

routes.doc("/doc", {
	openapi: "3.1.0",
	info: {
		title: "HTML Markdowner API",
		version: "1.0.0",
		description:
			"A blazingly fast API that converts HTML pages to clean Markdown format. Built with Bun, Hono, and Redis.",
		contact: {
			name: "API Support",
			email: "support@touchtech.club",
			url: "https://touchtech.club",
		},
	},
	servers: [
		{
			url: "http://localhost:3000",
			description: "Local development server",
		},
		{
			url: "https://mder.touchtech.club",
			description: "Production server",
		},
	],
});

// Root endpoint - Scalar API documentation using the generated OpenAPI spec
routes.get(
	"/",
	Scalar({
		theme: "alternate",
		url: "/doc",
	}),
);
