import { ellipsizeFilename, humanizeSize } from "~/lib/files";
import { FileThumbnail } from "./non-image-thumb";

interface Props {
	media: {
		id: number;
		url: string;
		filename: string;
		size: number;
		contentType: string;
	};
	onRemove?: VoidFunction;
}

function MediaSelectItem({ media, onRemove }: Props) {
	return (
		<div className="flex border dark:border-neutral-700 rounded-lg p-1 gap-2 bg-stone-100 dark:bg-neutral-900 animate-zoom-in animate-duration-150">
			<div className="shrink-0">
				<Thumbnail media={media} />
			</div>

			<div className="flex-1">
				<div className="font-mono leading-tight line-clamp-1 break-all text-sm">
					{ellipsizeFilename(media.filename)}
				</div>

				<div className="text-secondary text-sm leading-none">
					{humanizeSize(media.size)}
				</div>
			</div>

			{onRemove && (
				<div>
					<button
						type="button"
						className="p-2 rounded-full !bg-stone-200 !dark:bg-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-700 transition-[background] duration-200"
						onClick={onRemove}
					>
						<div className="i-lucide-x" />
					</button>
				</div>
			)}
		</div>
	);
}

function Thumbnail({ media }: { media: Props["media"] }) {
	if (media.contentType.startsWith("image/")) {
		return (
			<img
				src={media.url}
				width={30}
				alt={media.filename}
				className="size-10 object-cover rounded-lg border dark:border-neutral-700"
			/>
		);
	}

	return <FileThumbnail contentType={media.contentType} />;
}

export { MediaSelectItem };
