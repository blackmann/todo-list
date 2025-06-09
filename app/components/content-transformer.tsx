import { Element, type HTMLReactParserOptions } from "html-react-parser";
import { TASK_LIST_ITEM_REGEX } from "~/lib/constants";
import { TaskListItem } from "./task-list-item";

interface ContentTransformerProps {
	rawContent: string;
	updateComment: (nextContent: string) => void;
}

function createContentTransformer({
	rawContent,
	updateComment,
}: ContentTransformerProps): HTMLReactParserOptions["replace"] {
	const getTaskListLines = (markdown: string) => {
		return markdown
			.split("\n")
			.filter((line) => TASK_LIST_ITEM_REGEX.test(line));
	};

	const taskLines = getTaskListLines(rawContent);
	let taskIndex = 0;

	return (node) => {
		if (node instanceof Element && node.name === "li") {
			const hasCheckbox = node.children.some(
				(child) =>
					child instanceof Element &&
					child.name === "input" &&
					child.attribs?.type === "checkbox",
			);

			if (hasCheckbox && taskLines[taskIndex]) {
				const originalLine = taskLines[taskIndex];
				taskIndex++;

				return (
					<TaskListItem
						line={originalLine}
						content={rawContent}
						updateComment={updateComment}
					/>
				);
			}
		}
	};
}

export { createContentTransformer };
