import type { Prisma } from "@prisma/client";
import argon2 from "argon2";
import { redirect } from "react-router";
import { authCookie } from "./cookies.server";
import { prisma } from "./prisma.server";
import { badRequest } from "./responses";
import { sendWebhook } from "./webhook";

export async function createAccount(
	username: string,
	password: string,
	invite: string | null,
) {
	const userCreated = await prisma.user.count();

	if (invite) {
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

	const hashedPassword = await argon2.hash(password);
	const user = await prisma.user.create({
		data: {
			username,
			password: hashedPassword,
			superUser: userCreated === 0,
		},
	});

	if (userCreated > 0) {
		sendWebhook("user.joined", {
			user,
		});
	}

	if (invite) {
		const allUsers = await prisma.user.findMany({
			select: { id: true },
		});

		const res = await admit(user, invite);

		const inviteProject = await prisma.inviteToken.findUnique({
			where: { token: invite },
			select: { projectId: true },
		});

		if (!inviteProject) {
			return res;
		}

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
					projectId: inviteProject.projectId,
				})),
		});

		return res;
	}

	if (userCreated === 0) {
		const projects = await prisma.project.findMany();

		prisma.projectAccess.createMany({
			data: projects.map((project) => ({
				userId: user.id,
				projectId: project.id,
			})),
		});
	}

	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize({ userId: user.id }),
		},
	});
}

export async function login(
	username: string,
	password: string,
	token?: string | null,
) {
	const user = await prisma.user.findUnique({ where: { username } });
	if (!user) {
		return badRequest({ detail: "Incorrect username or password" });
	}

	const isPasswordValid = await argon2.verify(user.password, password);
	if (!isPasswordValid) {
		return badRequest({ detail: "Incorrect username or password" });
	}

	if (token) {
		return await admit(user, token);
	}

	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize({ userId: user.id }),
		},
	});
}

export async function admit(
	user: Prisma.UserGetPayload<{ omit: { password: true } }>,
	token: string,
) {
	const inviteToken = await prisma.inviteToken.findFirst({
		where: { token, used: false, expiresAt: { gt: new Date() } },
		select: { projectId: true },
	});

	if (!inviteToken) {
		throw badRequest({ detail: "Invalid or expired invite token" });
	}

	const alreadyIn = await prisma.projectAccess.findFirst({
		where: {
			userId: user.id,
			projectId: inviteToken.projectId,
		},
		include: { project: true },
	});

	await prisma.inviteToken.update({
		where: { token },
		data: { used: true, usedAt: new Date() },
	});

	if (alreadyIn) {
		return redirect(`/${alreadyIn.project.slug}`);
	}

	const access = await prisma.projectAccess.create({
		data: { userId: user.id, projectId: inviteToken.projectId },
		include: { project: true },
	});

	return redirect(`/${access.project.slug}`, {
		headers: {
			"Set-Cookie": await authCookie.serialize({ userId: user.id }),
		},
	});
}
