# Todo List

![Screenshot](./assets/screenshot.jpg)

For small teams, todo list helps you get things done. Simple!

You can immediately deploy your version with the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblackmann%2Ftodo-list&env=COOKIE_SECRET&integration-ids=oac_3sK3gnG06emjIEVL09jjntDD)

## Development

Yarn is the package manager. Run `yarn` to install the dependencies.

Prisma is the ORM. Run `yarn prisma generate` to generate the Prisma client and `yarn prisma migrate deploy` to apply the migrations.

Postgres is the database. Run `yarn prisma studio` to open the Prisma studio and view records. Or you can use a GUI app like TablePlus or whatever you like.

### Environment Variables

```bash
DATABASE_URL="postgresql://postgres@127.0.0.1:5432/todolist"
COOKIE_SECRET="somerandomstring"
```

## Webhook Integrations

Todo List supports webhook integrations to notify external services about events that occur in the application. Currently, Discord integration is available.

### Configuration

For Discord webhooks, you can use a simple configuration in `.env` with:

```bash
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/your/webhook/url"
```

Or for more advanced configuration with multiple webhooks and event filtering:

```bash
WEBHOOKS='[
  {
    "type": "discord",
    "url": "https://discord.com/api/webhooks/your/webhook/url",
    "enabled": true,
    "events": ["task.created", "task.status_changed", "comment.created"]
  }
]'
```

### Supported Event Types

- `task.created`: When a new task is created
- `task.updated`: When a task's details are updated
- `task.status_changed`: When a task's status changes
- `task.assigned`: When a task is assigned to someone
- `task.deleted`: When a task is deleted
- `comment.created`: When a comment is added to a task
- `user.joined`: When a new user joins

### Creating Custom Webhook Integrations

You can extend Todo List with your own webhook integrations by following these steps:

1. Create a new integration file in `/app/lib/` (e.g., `slack.ts`). You can check `discord.ts` for an example:

```typescript
// Example Slack integration
import type { EventType, WebhookConfig, WebhookEventData, WebhookIntegration } from "./webhook-types";

const slackWebhook: WebhookIntegration = {
  name: "Slack",
  
  async send(
    eventType: EventType,
    data: WebhookEventData,
    config: WebhookConfig
  ): Promise<boolean> {
    // Format and send data to Slack
    const payload = createSlackPayload(eventType, data);
    
    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      return response.ok;
    } catch (error) {
      console.error("Slack webhook error:", error);
      return false;
    }
  }
};

function createSlackPayload(eventType: EventType, data: WebhookEventData) {
  // Transform the event data into a Slack-compatible format
  // ...
}

export { slackWebhook };
```

2. Register your integration in `webhook.ts`:

```typescript
import { discordWebhook } from "./discord";
import { slackWebhook } from "./slack";  // Import your integration
import type { EventType, WebhookEventData } from "./webhook-types";

// Registry of available webhook integrations
const webhookIntegrations = {
  discord: discordWebhook,
  slack: slackWebhook,  // Add your integration here
  // Other integrations go here
};

// ...rest of the file
```

3. Use the integration in your configuration:

```bash
WEBHOOKS='[
  {
    "type": "slack",
    "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
    "enabled": true,
    "events": ["task.created", "user.joined"]
  }
]'
```

Your custom webhook will now be triggered for the specified events.

