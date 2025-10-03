import { z } from "@hono/zod-openapi";

// Zod schema for query parameters
export const urlQuerySchema = z.object({
	url: z
		.string()
		.url()
		.openapi({
			param: {
				name: "url",
				in: "query",
			},
			example: "https://example.com",
			description: "The URL to convert to Markdown",
		}),
	enableDetailedResponse: z
		.string()
		.optional()
		.transform((val) => val === "true")
		.openapi({
			param: {
				name: "enableDetailedResponse",
				in: "query",
			},
			example: "false",
			description:
				"Return full page content instead of just the article content",
		}),
});

// Response schemas
export const MarkdownResponseSchema = z
	.object({
		url: z.string().url().openapi({
			example: "https://example.com",
		}),
		md: z.string().openapi({
			example: "# Example Domain\n\nThis domain is...",
		}),
	})
	.openapi("MarkdownResponse");

export const ErrorResponseSchema = z
	.object({
		error: z.string().openapi({
			example: "Invalid URL provided",
		}),
		details: z.string().optional().openapi({
			example: "Additional error details",
		}),
	})
	.openapi("ErrorResponse");

export const HealthResponseSchema = z
	.object({
		status: z.string().openapi({
			example: "ok",
		}),
		redis: z.string().openapi({
			example: "connected",
		}),
	})
	.openapi("HealthResponse");

// Helper function to check if URL is valid
export function isValidUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}
