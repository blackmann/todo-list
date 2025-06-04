# Todo List

![Screenshot](./assets/screenshot.jpg)

For small teams, Todo List helps you get things done. Simple!

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
BASE_URL= # falls back to VERCEL_PROJECT_PRODUCTION_URL which is set on Vercel environments
WEBHOOK_URL= # optional
DISCORD_WEBHOOK_URL= # optional, see Webhook section
DISCORD_BOT_NAME= # optional, defaults to "kovacs"
```

## Webhook Integration

If a `WEBHOOK_URL` is provided, the endpoint is called with the following events:

| Event Name | Description |
|------------|-------------|
| `task.created` | Triggered when a new task is created |
| `task.updated` | Triggered when a task is updated |
| `task.deleted` | Triggered when a task is deleted |
| `task.status_changed` | Triggered when a task's status changes |
| `task.assigned` | Triggered when a task is assigned to a user |
| `comment.created` | Triggered when a comment is added to a task |
| `user.joined` | Triggered when a new user joins the system |

### Discord Integration

Todo List implements webhook integration for Discord messaging for these events.

To set up Discord notifications:

1. Provide a `DISCORD_WEBHOOK_URL` that contains a valid Discord webhook endpoint. See [Discord's Webhook Guide](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) on how to create this endpoint in your server.
2. Set `WEBHOOK_URL` to `https://<your-todolist-domain>/webhook/discord`

Voila, your discord server will start receiving events.


