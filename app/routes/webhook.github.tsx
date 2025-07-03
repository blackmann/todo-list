import crypto from "node:crypto";
import type { ActionFunctionArgs } from "react-router";
import {
	type EventTypeMap,
	type GitHubEventType,
	handleInstallationEvent,
	handlePullRequestEvent,
	type InstallationEvent,
	type PREvent,
} from "~/lib/github";
import { badRequest } from "~/lib/responses";

export const action = async ({ request }: ActionFunctionArgs) => {
	const eventType = request.headers.get("x-github-event") as GitHubEventType;
	const event = (await request.json()) as EventTypeMap[typeof eventType];
	const signature = request.headers.get("x-hub-signature-256")!;

	verifyRequest(event, signature);

	switch (eventType) {
		case "installation":
			await handleInstallationEvent(event as InstallationEvent);
			break;
		case "pull_request":
			await handlePullRequestEvent(event as PREvent);
			break;
	}

	return {};
};

function verifyRequest(event: any, signature: string) {
	const hash = `sha256=${crypto
		.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!)
		.update(JSON.stringify(event))
		.digest("hex")}`;

	if (hash === signature) {
		return true;
	}

	throw badRequest("Verifying request failed");
}
