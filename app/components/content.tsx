import parse from "html-react-parser";
import { createContentTransformer } from "./content-transformer";

interface Props {
	content: string;
	rawContent: string;
	updateComment: (nextContent: string) => void;
}

function Content({ content, rawContent, updateComment }: Props) {
	if (!content) return null;

	const transform = createContentTransformer({
		rawContent,
		updateComment,
	});

	return (
		<article className="comment-article">
			{parse(content, { replace: transform })}
		</article>
	);
}

export { Content };
