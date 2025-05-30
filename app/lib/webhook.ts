import { discordWebhook } from "./discord";
import type { EventType, WebhookEventData } from "./webhook-types";

// Registry of available webhook integrations
const webhookIntegrations = {
	discord: discordWebhook,
	// Other integrations go here, e.g. slack, email, whatsapp, etc.
};

async function triggerWebhook(
	eventType: EventType,
	data: WebhookEventData,
): Promise<void> {
	try {
		const webhookConfigs = getWebhookConfigs();

		if (!webhookConfigs?.length) return;

		for (const config of webhookConfigs) {
			if (config.enabled === false) continue;

			if (config.events && !config.events.includes(eventType)) continue;

			const integration =
				webhookIntegrations[config.type as keyof typeof webhookIntegrations];

			if (!integration) {
				console.warn(`Webhook type "${config.type}" not implemented`);
				continue;
			}

			// Fire and forget - don't await the result
			integration.send(eventType, data, config).catch((error: any) => {
				console.error(`Error sending ${config.type} webhook:`, error);
			});
		}
	} catch (error) {
		console.error("Error triggering webhooks:", error);
	}
}

function getWebhookConfigs() {
	try {
		const webhooksEnv = process.env.WEBHOOKS;
		if (!webhooksEnv) return [];

		return JSON.parse(webhooksEnv);
	} catch (error) {
		console.error("Error parsing WEBHOOKS environment variable:", error);
		return [];
	}
}

export { triggerWebhook };
