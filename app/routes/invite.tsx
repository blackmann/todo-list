import { addHours } from "date-fns";
import { nanoid } from "nanoid";
import { prisma } from "~/lib/prisma.server";

export const loader = async () => {
	const token = nanoid(10);
	const expiresAt = addHours(new Date(), 12);

	await prisma.inviteToken.create({
		data: {
			token,
			expiresAt,
		},
	});

	return { token };
};
