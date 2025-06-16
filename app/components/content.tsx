import parse from "html-react-parser";
import React from "react";

interface Props {
	content: string;
	rawContent: string;
	onCheckListItem: (line: number, checked: boolean) => void;
	isDisabled?: boolean;
}

function Content({ content, onCheckListItem, isDisabled = false }: Props) {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!ref.current) return;

		const checkboxes = ref.current.querySelectorAll(
			'input[type="checkbox"][data-task-line]',
		);

		const handleCheckboxChange = (event: Event) => {
			const target = event.target as HTMLInputElement;
			const lineNumber = target.dataset.taskLine;

			if (!lineNumber) return;

			onCheckListItem(Number(lineNumber), target.checked);
		};

		for (const checkbox of checkboxes) {
			checkbox.addEventListener("change", handleCheckboxChange);
			if (isDisabled) {
				checkbox.setAttribute("disabled", "true");
			} else {
				checkbox.removeAttribute("disabled");
			}
		}

		return () => {
			for (const checkbox of checkboxes) {
				checkbox.removeEventListener("change", handleCheckboxChange);
			}
		};
	}, [onCheckListItem, isDisabled]);

	if (!content) return null;

	return (
		<article className="comment-article" ref={ref}>
			{parse(content)}
		</article>
	);
}

export { Content };
