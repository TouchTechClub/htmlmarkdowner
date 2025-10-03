import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { fetchAndProcessPage } from "../lib/markdown";
import {
	ErrorResponseSchema,
	isValidUrl,
	MarkdownResponseSchema,
	urlQuerySchema,
} from "../lib/validation";
import { limiter } from "../middleware/rate-limiter";

export const convertRouter = new OpenAPIHono();

// Define the convert route
const convertRoute = createRoute({
	method: "get",
	path: "/convert",
	request: {
		query: urlQuerySchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.array(MarkdownResponseSchema),
				},
				"text/plain": {
					schema: z.string().openapi({
						example: "# Example Domain\n\nThis domain is...",
					}),
				},
			},
			description: "Successful conversion",
		},
		400: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "Invalid parameters or URL",
		},
		429: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "Rate limit exceeded",
		},
		500: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "Server error",
		},
	},
	tags: ["Conversion"],
	summary: "Convert URL to Markdown",
	description: "Converts HTML from a given URL to clean Markdown format.",
});

// Implement the convert route
convertRouter.use("/convert", limiter);

// @ts-expect-error - Response type is correct but TypeScript has issues with mixed content types
convertRouter.openapi(convertRoute, async (c) => {
	const { url, enableDetailedResponse = false } = c.req.valid("query");

	// Validate URL format
	if (!isValidUrl(url)) {
		return c.json(
			{
				error:
					"Invalid URL provided, should be a full URL starting with http:// or https://",
			},
			400,
		);
	}

	const contentType = c.req.header("accept")?.includes("application/json")
		? "json"
		: "text";

	try {
		// Fetch and convert the page
		const markdown = await fetchAndProcessPage(url, enableDetailedResponse);

		if (contentType === "json") {
			return c.json([{ url, md: markdown }]);
		}
		return c.text(markdown);
	} catch (err) {
		return c.json(
			{
				error: err instanceof Error ? err.message : "Unknown error occurred",
			},
			500,
		);
	}
});
