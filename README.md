# care_notifications_fe - Care FE Plugin

A CARE frontend plugin that provides in-app notifications and web push notification support. Need backend plugin [care_notifications_be](https://github.com/ohcnetwork/care_notifications_be/) enabled for this.

## Features

- **In-App Notifications** — Real-time notification feed with polling, read/unread management, and filtering
- **Web Push Notifications** — Browser push notification support via the Web Push API (VAPID)
- **Notification Bell Icon** — Nav bar icon with unread badge count
- **Filtering & Ordering** — Filter notifications by event type, resource type, facility, and read status

### Supported Notification Types

| Category | Events |
| --- | --- |
| Bookings | Confirmation, Reminder, Cancellation, Reschedule |
| Diagnostics | Report Ready |
| Service Requests | Raised |
| Encounters | IP Created |
| Medication Stock | Near Expiry, Low Stock |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- A running instance of [Care Frontend](https://github.com/ohcnetwork/care_fe)

### Installation

```bash
npm install
```

### Development

Start the dev server with hot-reload (builds on file change and serves via Vite preview):

```bash
npm start
```

The plugin will be served at `http://localhost:10125`.

### Production Build

```bash
npm run build
```

The output is written to `dist/` with `remoteEntry.js` as the module federation entry point.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm start` | Build in watch mode and serve via Vite preview |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run lint-fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run sort-locales` | Sort locale JSON files alphabetically |

## Integration with Care

```bash
{
  "url": "http://localhost:10125/assets/remoteEntry.js",
  "config": {
    "NOTIFICATION_POLL_INTERVAL": "1000"
  },
  "name": "care_notifications_fe"
}
```

This plugin uses [Module Federation](https://github.com/nicedoc/vite-plugin-federation) to expose its manifest to the Care frontend host. The manifest registers:

- **Routes** — `/facility/:facilityId/notifications` and `/facility/:facilityId/users/:user/notifications`
- **Nav Items** — Notification bell icon in the sidebar and user menu

To connect the plugin to Care, add the plugin's remote entry URL to the Care frontend configuration.
