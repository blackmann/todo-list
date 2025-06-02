import argon2 from "argon2";
import { redirect } from "react-router";
import { authCookie } from "./cookies.server";
import { prisma } from "./prisma.server";
import { badRequest } from "./responses";
import { sendWebhook } from "./webhook";

async function createAccount(
	username: string,
	password: string,
	invite: string | null,
) {
	const userCreated = await prisma.user.count();

	if (userCreated > 0 && invite) {
		const valid = await prisma.inviteToken.findFirst({
			where: {
				token: invite,
				used: false,
				expiresAt: { gt: new Date() },
			},
		});

		if (!valid) {
			return badRequest({ detail: "Invalid or expired invite token" });
		}
	}

	const existingUser = await prisma.user.findUnique({ where: { username } });
	if (existingUser) {
		return badRequest({ detail: "Username already taken" });
	}

	if (invite) {
		await prisma.inviteToken.update({
			where: { token: invite },
			data: { used: true, usedAt: new Date() },
		});
	}

	const hashedPassword = await argon2.hash(password);
	const user = await prisma.user.create({
		data: {
			username,
			password: hashedPassword,
			superUser: userCreated === 0,
		},
	});

	if (userCreated > 0) {
		const allUsers = await prisma.user.findMany({
			select: { id: true },
		});

		await prisma.notification.createMany({
			data: allUsers
				.filter((u) => u.id !== user.id)
				.map((u) => ({
					message: `New member @[user/${user.id}] has joined`,
					userId: u.id,
					type: "new_member",
					meta: {
						newUserId: user.id,
						username,
					},
				})),
		});

		sendWebhook("user.joined", {
			user,
		});
	}

	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize({ userId: user.id }),
		},
	});
}

async function login(username: string, password: string) {
	const user = await prisma.user.findUnique({ where: { username } });
	if (!user) {
		return badRequest({ detail: "Incorrect username or password" });
	}

	const isPasswordValid = await argon2.verify(user.password, password);
	if (!isPasswordValid) {
		return badRequest({ detail: "Incorrect username or password" });
	}

	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize({ userId: user.id }),
		},
	});
}

export { createAccount, login };
