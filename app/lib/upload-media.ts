import compress, {
	type Options as CompressOptions,
} from "browser-image-compression";
import { isImage } from "./is-image";

interface UploadResult {
	url: string;
	filename: string;
	size: number;
	contentType: string;
	thumbnail?: string;
}

async function uploadMedia(
	file: File,
	folder = "uploads",
): Promise<UploadResult> {
	const formData = new FormData();

	if (isImage(file.type, true)) {
		formData.append("file", await compressFile(file));
	} else {
		formData.append("file", file);
	}

	formData.append("folder", folder);

	const res = await fetch("/media", {
		method: "POST",
		body: formData,
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error || `Upload failed: ${res.status}`);
	}

	return await res.json();
}

const compressOptions: CompressOptions = {
	maxSizeMB: 0.6,
	maxWidthOrHeight: 1920,
};

function fileFromBlob(f: File) {
	return new File([f], f.name, { type: f.type });
}

async function compressFile(file: File) {
	const blob = await compress(file, compressOptions);
	return fileFromBlob(blob);
}

export { uploadMedia };
