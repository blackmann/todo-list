import type { Media } from "@prisma/client";
import clsx from "clsx";
import { ellipsizeFilename, humanizeSize } from "~/lib/files";
import { FileThumbnail } from "./non-image-thumb";

interface Props {
	media: Media;
}

function MediaItem({ media }: Props) {
	if (media.contentType.startsWith("image/")) {
		return (
			<img
				src={media.url}
				alt={media.filename}
				className="w-full h-full object-cover rounded-lg"
			/>
		);
	}

	return (
		<div className="!w-23rem text-start text-sm flex gap-2 py-1 px-1 rounded-lg w-full border border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-900 !bg-opacity-30">
			<div>
				<Thumbnail
					thumbnail={media.thumbnail}
					className={"size-10 rounded-lg dark:bg-transparent"}
					contentType={media.contentType as string}
					name={media.filename as string}
				/>
			</div>

			<div>
				<div className="font-mono break-all">
					{ellipsizeFilename(media.filename, 30)}
				</div>
				<div className="text-secondary leading-none">
					{humanizeSize(media.size)}
				</div>
			</div>
		</div>
	);
}

interface ThumbnailProps {
	contentType: string;
	name: string;
	thumbnail?: string | null;
	className?: string;
}

function Thumbnail({
	className,
	contentType,
	thumbnail,
	name,
}: ThumbnailProps) {
	if (contentType.startsWith("image/")) {
		return (
			<img
				src={thumbnail as string}
				alt={name}
				className={clsx("size-10 object-cover rounded-lg", className)}
			/>
		);
	}

	return <FileThumbnail className={className} contentType={contentType} />;
}
export { MediaItem, Thumbnail };
