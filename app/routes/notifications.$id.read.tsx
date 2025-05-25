import type { LoaderFunctionArgs } from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	await checkAuth(request);

	await prisma.notification.update({
		where: {
			id: Number(params.id),
		},
		data: {
			read: true,
		},
	});

	return { read: true };
};
