import type { Media, Prisma } from "@prisma/client";
import React from "react";
import { authorTime } from "~/lib/dates";
import { ellipsizeFilename } from "~/lib/files";
import { CopyButton } from "./copy-button";
import { Thumbnail } from "./media-item";
import { Modal } from "./modal";
import { Profile } from "./profile";

type Comment = Prisma.CommentGetPayload<{
	include: {
		Media: true;
		author: {
			select: {
				username: true;
			};
		};
	};
}>;

interface Props {
	open?: boolean;
	onClose?: VoidFunction;
	comment: Comment;
	media?: Media;
	setMedia?: (media: Media) => void;
}

function MediaPreview({ media, open, onClose, comment, setMedia }: Props) {
	React.useEffect(() => {
		if (!media) return;
		const it = document.querySelector(`#preview-media-${media.id}`);
		it?.scrollIntoView();
	}, [media]);

	const otherMedia = comment.Media.filter((m) => m.id !== media?.id);

	return (
		<Modal
			className="w-screen md:w-[30rem] aspect-[2/3]"
			open={open}
			onClose={onClose}
		>
			{media && (
				<div className="flex flex-col h-full fade-in">
					<div className="h-[76%] bg-stone-100 dark:bg-neutral-800 border-b border-stone-200 dark:border-neutral-700 relative flex items-center overflow-hidden">
						{media?.contentType.startsWith("image/") ? (
							<img
								key={media.id}
								className="object-contain self-center"
								src={media.url}
								alt={media.filename}
							/>
						) : media?.contentType?.startsWith("video/") ? (
							// biome-ignore lint/a11y/useMediaCaption: <explanation>
							<video className="w-full" playsInline src={media.url} controls />
						) : (
							<div className="w-full justify-center text-secondary flex items-center gap-2 font-medium">
								<div className="i-lucide-tower-control" /> Cannot preview this
								file. Download instead.
							</div>
						)}

						<button
							type="button"
							className="size-7 rounded-full !bg-stone-200/50 !dark:bg-neutral-800/50 flex items-center justify-center text-secondary absolute right-2 top-2 focus:outline-none"
							onClick={() => onClose?.()}
						>
							<div className="i-lucide-x text-black dark:text-white" />
						</button>

						<div className="dark:border-neutral-800 rounded-lg px-1 py-0.5 font-mono flex gap-1 items-center absolute top-2 left-2 bg-stone-200 dark:bg-neutral-800 !bg-opacity-50">
							<Thumbnail
								thumbnail={media?.thumbnail ?? media.url}
								className={"size-5 rounded-sm dark:bg-transparent"}
								contentType={media?.contentType as string}
								name={media?.filename as string}
							/>
							{ellipsizeFilename(media?.filename as string, 30)}
						</div>
					</div>

					<div className="h-[24%]">
						<ul className="overflow-x-auto flex gap-2 p-1">
							{otherMedia.map((it) => {
								return (
									<li
										className="shrink-0"
										key={it.id}
										id={`preview-media-${it.id}`}
									>
										<button
											className="border dark:border-neutral-700 dark:bg-neutral-800 rounded-lg px-1 py-0.5 font-mono flex gap-1 items-center text-secondary"
											type="button"
											onClick={() => setMedia?.(it)}
										>
											<Thumbnail
												thumbnail={it.thumbnail ?? it.url}
												className={"size-5 rounded-sm dark:bg-transparent"}
												contentType={it.contentType as string}
												name={it.filename as string}
											/>
											{ellipsizeFilename(it.filename as string)}
										</button>
									</li>
								);
							})}
						</ul>

						<header className="flex gap-2 p-2 items-start">
							<div>
								<div className="pt-1">
									<Profile username={comment.author.username} />
								</div>

								<p className="font-mono pt-1 text-secondary text-sm">
									commented on {authorTime(comment.createdAt)}
								</p>

								{Boolean(otherMedia.length) && (
									<p className="text-sm text-secondary font-mono">
										{comment.Media.length} attachments
									</p>
								)}
							</div>
						</header>

						<div className="flex gap-2 px-2 items-center">
							<CopyButton
								text={media?.url as string}
								className="bg-stone-100 dark:bg-neutral-800 rounded-lg inline-flex gap-2 items-center px-1 py-0.5 border border-stone-200 dark:border-neutral-700 font-medium !text-black !dark:text-white"
							>
								<span>Copy link</span>
							</CopyButton>

							<a
								className="bg-stone-100 dark:bg-neutral-800 rounded-lg inline-flex gap-2 items-center px-1 py-0.5 border border-stone-200 dark:border-neutral-700 font-medium"
								href={media?.url}
								target="_blank"
								rel="noreferrer"
							>
								Download file
								<div className="i-lucide-download text-secondary" />
							</a>
						</div>
					</div>
				</div>
			)}
		</Modal>
	);
}

export { MediaPreview };
