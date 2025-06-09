import { useState } from "react";
import {
	TASK_LIST_CHECKED_REGEX,
	TASK_LIST_LABEL_REGEX,
	TASK_LIST_REPLACE_REGEX,
} from "~/lib/constants";
import { Checkbox } from "./checkbox";

interface TaskListItemProps {
	line: string;
	updateComment: (nextContent: string) => void;
	content: string;
}

export function TaskListItem({
	line,
	content,
	updateComment,
}: TaskListItemProps) {
	const initialChecked = TASK_LIST_CHECKED_REGEX.test(line);
	const [isChecked, setIsChecked] = useState(initialChecked);

	function handleChange(checked: boolean) {
		if (!content.includes(line)) return;

		setIsChecked(checked);

		const newLine = line.replace(
			TASK_LIST_REPLACE_REGEX,
			(_, bullet) => `${bullet} [${checked ? "x" : " "}]`,
		);

		const newContent = content.replace(line, newLine);

		updateComment(newContent);
	}

	const label = line.replace(TASK_LIST_LABEL_REGEX, "");

	return (
		<div className="flex items-center gap-2">
			<Checkbox checked={isChecked} onChange={handleChange} />
			<span>{label}</span>
		</div>
	);
}
