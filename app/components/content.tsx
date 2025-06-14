import type { Media, Prisma } from "@prisma/client";
import parse from "html-react-parser";
import React from "react";
import { createContentTransformer } from "./content-transformer";
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
	updateComment: (nextContent: string) => void;
}

function Content({ comment, rawContent, updateComment }: Props) {
	if (!comment) return null;

	const [media, setMedia] = React.useState<Media | undefined>(undefined);

	const transform = createContentTransformer({
		rawContent,
		updateComment,
	});

	return (
		<>
			<article className="comment-article">
				{parse(comment.content, { replace: transform })}

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
