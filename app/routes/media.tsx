import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { customAlphabet } from "nanoid";
import type { ActionFunctionArgs } from "react-router";
import sharp from "sharp";
import { isImage } from "~/lib/is-image";
import { prisma } from "~/lib/prisma.server";
import { badRequest, methodNotAllowed } from "~/lib/responses";
import { makeSingleton } from "~/lib/singleton";
import { slugify } from "~/lib/slugify";

const s3 = makeSingleton("s3-client", () => {
	return new S3Client({
		endpoint: process.env.AWS_ENDPOINT!,
		region: process.env.AWS_REGION!,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY!,
			secretAccessKey: process.env.AWS_SECRET_KEY!,
		},
	});
});

const generateKey = customAlphabet(
	"abcde0123456789fghijklmnABCDEFGHNOPopqrstWXYZuvwxyz",
	10,
);

export const action = async ({ request }: ActionFunctionArgs) => {
	if (request.method === "POST") {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const folder = formData.get("folder") as string;

		if (!file) {
			throw badRequest({ error: "No file uploaded" });
		}

		try {
			let processedBuffer: Buffer;
			let thumbnailBuffer: Buffer | null = null;
			let contentType = file.type;
			let extension = file.name.split(".").pop()?.toLowerCase();

			const buffer = Buffer.from(await file.arrayBuffer());

			if (isImage(file.type, true)) {
				processedBuffer = await sharp(buffer)
					.resize(1920, 1920, {
						fit: "inside",
						withoutEnlargement: true,
					})
					.jpeg({ quality: 85 })
					.toBuffer();

				thumbnailBuffer = await sharp(buffer)
					.resize(320, 320, {
						fit: "cover",
						position: "center",
					})
					.jpeg({ quality: 80 })
					.toBuffer();

				contentType = "image/jpeg";
				extension = "jpg";
			} else {
				processedBuffer = buffer;
			}

			const mangled = mangle(file.name, extension!);
			const key = `${folder}/${mangled}`;

			const command = new PutObjectCommand({
				ACL: "public-read",
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: key,
				Body: processedBuffer,
				ContentType: contentType,
				CacheControl: "max-age=31536000",
			});

			const uploads = [s3.send(command)];
			let thumbnailUrl: string | null = null;

			if (thumbnailBuffer) {
				const thumbnailKey = `${folder}/thumbs/${mangled}`;

				const thumb = new PutObjectCommand({
					ACL: "public-read",
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: thumbnailKey,
					Body: thumbnailBuffer,
					ContentType: "image/jpeg",
					CacheControl: "max-age=31536000",
				});

				uploads.push(s3.send(thumb));
				thumbnailUrl = `${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${thumbnailKey}`;
			}

			await Promise.all(uploads);

			const url = `${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${key}`;

			return {
				url,
				filename: file.name,
				size: processedBuffer.length,
				contentType,
				thumbnail: thumbnailUrl,
			};
		} catch (error: any) {
			throw badRequest({ error: error.message });
		}
	}

	if (request.method === "PATCH") {
		const data = await request.json();
		const ids: string[] = data.ids;

		if (!ids || !Array.isArray(ids) || ids.length === 0) throw badRequest();

		await prisma.media.deleteMany({
			where: {
				id: {
					in: ids.map(Number),
				},
			},
		});

		return {};
	}

	throw methodNotAllowed();
};

function mangle(filename: string, extension: string) {
	const rstr = generateKey(8);
	const timestamp = Date.now();

	const parts = filename.split(".");
	parts.pop();
	const cleanName = slugify(parts.join("."));
	return `${cleanName}-${timestamp}_${rstr}.${extension}`;
}
