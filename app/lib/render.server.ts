import rehypeShiki from "@shikijs/rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import smartypants from "remark-smartypants";
import { unified } from "unified";
import linkifyMentions from "./linkify-mentions";
import { removeCodeTrail } from "./remove-code-trail";

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeSanitize)
	.use(linkifyMentions)
	.use(remarkMath)
	.use(rehypeKatex)
	.use(rehypeExternalLinks, {
		rel: ["nofollow", "noopener", "noreferrer"],
		target: "_blank",
	})
	.use(removeCodeTrail)
	.use(rehypeShiki, {
		themes: { light: "snazzy-light", dark: "ayu-dark" },
	})
	.use(smartypants)
	.use(rehypeStringify);

async function render(content: string) {
	return (await processor.process(content)).toString();
}

export { render };
