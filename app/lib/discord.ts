import { sendDiscord } from "~/lib/send-discord";
import type {
	EventType,
	WebhookConfig,
	WebhookEventData,
	WebhookIntegration,
} from "./webhook-types";

const discordWebhook: WebhookIntegration = {
	name: "Discord",

	async send(
		eventType: EventType,
		data: WebhookEventData,
		config: WebhookConfig,
	): Promise<boolean> {
		return sendDiscord(eventType, data, config.url);
	},
};

export { discordWebhook };
