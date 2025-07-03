import type { Media, Prisma } from "@prisma/client";
import parse from "html-react-parser";
import React from "react";
import { MediaItem } from "./media-item";
import { MediaPreview } from "./media-preview";

interface Props {
	comment: Prisma.CommentGetPayload<{
		include: {
			Media: true;
			author: {
				select: {
					username: true;
				};
			};
		};
	}>;
	rawContent: string;
	onCheckListItem: (line: number, checked: boolean) => void;
	isDisabled?: boolean;
}

function Content({
	comment,
	onCheckListItem,
	isDisabled = false,
}: Props) {
	const [media, setMedia] = React.useState<Media | undefined>(undefined);
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

	if (!comment) return null;

	return (
		<>
			<article className="comment-article" ref={ref}>
				{parse(comment.content)}

				{comment.Media && comment.Media.length > 0 && (
					<div className="flex flex-col gap-2 mt-2">
						{comment.Media.map((media) => (
							<div key={media.id}>
								<button
									type="button"
									className="block bg-transparent border-none p-0 focus:outline-none cursor-pointer"
									onClick={() => setMedia(media)}
								>
									<MediaItem media={media} />
								</button>
							</div>
						))}
					</div>
				)}
			</article>

			<MediaPreview
				comment={comment}
				media={media}
				open={Boolean(media)}
				onClose={() => setMedia(undefined)}
				setMedia={setMedia}
			/>
		</>
	);
}

export { Content };
