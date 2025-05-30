import type { Status, Task, User } from "@prisma/client";

export type EventType =
	| "task.created"
	| "task.updated"
	| "task.deleted"
	| "task.status_changed"
	| "task.assigned"
	| "comment.created"
	| "user.joined";

export interface WebhookEventData {
	task?: Task & { assignee?: User };
	user?: User;
	previousStatus?: Status;
	comment?: string;
	updatedFields?: string[];
}

export interface WebhookConfig {
	enabled: boolean;
	url: string;
	events?: EventType[];
	// Add any platform-specific configuration here
	[key: string]: any;
}

export interface WebhookIntegration {
	name: string;
	send: (
		eventType: EventType,
		data: WebhookEventData,
		config: WebhookConfig,
	) => Promise<boolean>;
}
