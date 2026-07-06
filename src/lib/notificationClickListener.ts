import {
  resolveNotificationPath,
  runNotificationClickAction,
  waitForNotificationHandler,
} from "./notificationRegistry";

interface NotificationClickData {
  resource_type?: string;
  resource_id?: string;
  facility_id?: string;
  event_type?: string;
  payload?: Record<string, unknown>;
}

async function resolveAndNavigate(data: NotificationClickData) {
  // Plugins load in parallel; wait briefly for the owning handler to register
  if (data.resource_type) {
    await waitForNotificationHandler(data.resource_type);
  }

  const target = {
    resource_type: data.resource_type || "",
    resource_id: data.resource_id || "",
    facility_id: data.facility_id,
    event_type: data.event_type,
    payload: (data.payload as Record<string, string>) || {},
  };

  // Non-URL actions (e.g. answering an in-app call) take priority
  if (runNotificationClickAction(target)) return;

  const path = resolveNotificationPath(target);

  const fallback = data.facility_id
    ? `/facility/${data.facility_id}/notifications`
    : "/";

  window.location.assign(path || fallback);
}

/**
 * Handles notification click deep-linking, covering both cases:
 *
 * 1. App already open: care_fe's SW focuses the tab and posts a
 *    NOTIFICATION_CLICK message, which the listener below resolves.
 * 2. App closed: the SW opens /facility/{id}/notifications#notification_click={data};
 *    the hash is read once at plugin load and redirected.
 */
export function initNotificationClickListener() {
  // Case 1: live message from the SW while the app is open
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type !== "NOTIFICATION_CLICK") return;
    resolveAndNavigate(event.data.data || {});
  });

  // Case 2: hash set by the SW on a fresh window
  const hash = window.location.hash;
  if (!hash.includes("notification_click=")) return;

  try {
    const encoded = hash.split("notification_click=")[1];
    if (!encoded) return;

    const data = JSON.parse(decodeURIComponent(encoded));

    // Clear the hash to avoid re-triggering on refresh
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    resolveAndNavigate(data);
  } catch {
    // silently ignore malformed notification data
  }
}
