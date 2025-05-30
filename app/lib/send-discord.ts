import type { Status, Task, User } from "@prisma/client";
import type { EventType } from "./webhook-types";

interface DiscordWebhookPayload {
	content?: string;
	username?: string;
	avatar_url?: string;
	embeds?: DiscordEmbed[];
}

interface DiscordEmbed {
	title?: string;
	description?: string;
	url?: string;
	color?: number;
	fields?: {
		name: string;
		value: string;
		inline?: boolean;
	}[];
	author?: {
		name: string;
		url?: string;
		icon_url?: string;
	};
	footer?: {
		text: string;
		icon_url?: string;
	};
	timestamp?: string;
}

export async function sendDiscord(
	eventType: EventType,
	data: {
		task?: Task & { assignee?: User };
		user?: User;
		previousStatus?: Status;
		comment?: string;
		updatedFields?: string[];
	},
	webhookUrl?: string,
): Promise<boolean> {
	const url = webhookUrl || process.env.DISCORD_WEBHOOK_URL;

	if (!url) {
		return false;
	}

	try {
		const payload = createWebhookPayload(eventType, data);

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		return response.ok;
	} catch (e) {
		return false;
	}
}

function createWebhookPayload(
	eventType: EventType,
	data: {
		task?: Task & { assignee?: User };
		user?: User;
		previousStatus?: Status;
		comment?: string;
		updatedFields?: string[];
	},
): DiscordWebhookPayload {
	const { task, user, previousStatus, comment, updatedFields } = data;
	const appName = process.env.APP_NAME || "Todo List";
	const baseUrl = process.env.BASE_URL || "";

	const payload: DiscordWebhookPayload = {
		username: `${appName} Bot`,
		avatar_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(appName)}`,
	};

	const embed: DiscordEmbed = {
		color: getColorForEvent(eventType),
		timestamp: new Date().toISOString(),
		footer: {
			text: `${appName} by @_yogr`,
		},
	};

	switch (eventType) {
		case "task.created":
			if (!task) break;

			embed.title = "📣 New Task Created";
			embed.description = `${task.title} \`#${task.id}\``;

			if (baseUrl && task.id) {
				embed.url = baseUrl;
			}

			embed.fields = [
				{
					name: "Status",
					value: `\`${task.status}\``,
					inline: true,
				},
			];

			if (task.assignee) {
				embed.fields.push({
					name: "Assigned to",
					value: `\`@${task.assignee.username}\``,
					inline: true,
				});
			}

			if (user) {
				embed.author = {
					name: `Created by @${user.username}`,
					icon_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(user.username)}`,
				};
			}
			break;

		case "task.updated":
			if (!task || !updatedFields) break;

			embed.title = "✏️ Task Updated";
			embed.description = `Title update for \`#${task.id}\``;
			if (baseUrl && task.id) {
				embed.url = baseUrl;
			}

			embed.fields = updatedFields.map((field) => ({
				name: `New ${formatFieldName(field)}`,
				value: `\`${formatFieldValue(field, task)}\``,
				inline: true,
			}));

			if (user) {
				embed.author = {
					name: `Updated by @${user.username}`,
					icon_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(user.username)}`,
				};
			}
			break;

		case "task.status_changed":
			if (!task || !previousStatus) break;

			embed.title = "💡 Task Status Changed";
			embed.description =
				task.status === "done"
					? `~~${task.title}~~ \`#${task.id}\``
					: `${task.title} \`#${task.id}\``;

			if (baseUrl && task.id) {
				embed.url = baseUrl;
			}

			embed.fields = [
				{
					name: "From",
					value: `\`${previousStatus}\``,
					inline: true,
				},
				{
					name: "To",
					value: `\`${task.status}\``,
					inline: true,
				},
			];

			if (user) {
				embed.author = {
					name: `Changed by @${user.username}`,
					icon_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(user.username)}`,
				};
			}
			break;

		case "task.assigned":
			if (!task) break;

			embed.title = "🖇️ Task Assigned";
			embed.description = `${task.title} \`#${task.id}\``;
			if (baseUrl && task.id) {
				embed.url = baseUrl;
			}

			if (task.assignee) {
				embed.fields = [
					{
						name: "Assigned to",
						value: `\`@${task.assignee.username}\``,
						inline: true,
					},
				];
			}

			if (user) {
				embed.author = {
					name: `Assigned by @${user.username}`,
					icon_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(user.username)}`,
				};
			}
			break;

		case "task.deleted":
			if (!task) break;

			embed.title = "🗑️ Task Deleted";
			embed.description = `${task.title} \`#${task.id}\``;

			if (user) {
				embed.author = {
					name: `Deleted by @${user.username}`,
					icon_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(user.username)}`,
				};
			}
			break;

		case "comment.created":
			if (!task || !comment) break;

			embed.title = "💬 New Comment";
			embed.description = `On task: ${task.title} \`#${task.id}\``;
			if (baseUrl && task.id) {
				embed.url = baseUrl;
			}

			embed.fields = [
				{
					name: "Comment",
					value:
						comment.length > 1018
							? `${comment.substring(0, 1015)}...`
							: `${comment}`,
				},
			];

			if (user) {
				embed.author = {
					name: `@${user.username}`,
					icon_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(user.username)}`,
				};
			}
			break;

		case "user.joined":
			if (!user) break;

			embed.title = "👋🏾 New User Joined";
			embed.description = `\`@${user.username}\` has joined the team!`;

			embed.author = {
				name: `@${user.username}`,
				icon_url: `https://api.dicebear.com/9.x/dylan/png?seed=${encodeURIComponent(user.username)}`,
			};
			break;
	}

	payload.embeds = [embed];
	return payload;
}

function getColorForEvent(eventType: EventType): number {
	switch (eventType) {
		case "task.created":
			return 0x4ade80;
		case "task.updated":
			return 0x60a5fa;
		case "task.status_changed":
			return 0x818cf8;
		case "task.assigned":
			return 0xa78bfa;
		case "task.deleted":
			return 0xf87171;
		case "comment.created":
			return 0xfbbf24;
		case "user.joined":
			return 0xf472b6;
		default:
			return 0x9ca3af;
	}
}

function formatFieldName(field: string): string {
	return field
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase());
}

function formatFieldValue(field: string, task: any): string {
	const value = task[field];

	if (value === null || value === undefined) {
		return "None";
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	if (value instanceof Date) {
		return value.toLocaleString();
	}

	return String(value);
}
