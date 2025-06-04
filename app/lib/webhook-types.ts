import type { Status, Task, User } from "@prisma/client";

export type SafeUser = Omit<User, "password">;

export type EventType =
	| "task.created"
	| "task.updated"
	| "task.deleted"
	| "task.status_changed"
	| "task.assigned"
	| "comment.created"
	| "user.joined";

export type WebhookPayload = {
	"task.created": {
		task: Task & { assignee?: SafeUser };
		user?: SafeUser;
		projectId: number;
	};

	"task.updated": {
		task: Task & { assignee?: SafeUser };
		user?: SafeUser;
		updatedFields: string[];
		projectId: number;
	};

	"task.deleted": {
		task: Task & { assignee?: SafeUser };
		user?: SafeUser;
		projectId: number;
	};

	"task.status_changed": {
		task: Task & { assignee?: SafeUser };
		user?: SafeUser;
		previousStatus: Status;
		projectId: number;
	};

	"task.assigned": {
		task: Task & { assignee?: SafeUser };
		user?: SafeUser;
		projectId: number;
	};

	"comment.created": {
		task: Task & { assignee?: SafeUser };
		user?: SafeUser;
		comment: string;
		projectId: number;
	};

	"user.joined": {
		user: SafeUser;
		projectId: number;
	};
};

export type WebhookEvent<T extends EventType> = {
	type: T;
} & WebhookPayload[T];

export type AnyWebhookEvent = {
	[K in EventType]: WebhookEvent<K>;
}[EventType];
