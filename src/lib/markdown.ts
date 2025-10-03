import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";

/**
 * Convert HTML to Markdown using Mozilla Readability and Turndown
 */
export async function htmlToMarkdown(
	html: string,
	enableDetailedResponse: boolean,
): Promise<string> {
	const dom = new JSDOM(html);
	const document = dom.window.document;

	// Remove unwanted elements
	document.querySelectorAll("script, style, iframe, noscript").forEach((el) => {
		el.remove();
	});

	let content: string;

	if (enableDetailedResponse) {
		// Use the entire body content
		content = document.body.innerHTML;
	} else {
		// Use Readability to extract article content
		const reader = new Readability(document, {
			charThreshold: 0,
			keepClasses: true,
			nbTopCandidates: 500,
		});
		const article = reader.parse();
		content = article?.content || document.body.innerHTML;
	}

	// Convert to markdown
	const turndownService = new TurndownService({
		headingStyle: "atx",
		codeBlockStyle: "fenced",
	});

	const markdown = turndownService.turndown(content);
	return markdown;
}

/**
 * Fetch a URL and convert its HTML to Markdown
 */
export async function fetchAndProcessPage(
	url: string,
	enableDetailedResponse: boolean,
): Promise<string> {
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});

		if (!response.ok) {
			return `Error: Failed to fetch URL (${response.status} ${response.statusText})`;
		}

		const html = await response.text();
		const markdown = await htmlToMarkdown(html, enableDetailedResponse);
		return markdown;
	} catch (error) {
		console.error("Error fetching page:", error);
		return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
	}
}
