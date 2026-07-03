import { notificationPath } from "./notificationPath";

interface NotificationClickData {
  resource_type?: string;
  resource_id?: string;
  facility_id?: string;
  payload?: Record<string, unknown>;
}

function resolveAndNavigate(data: NotificationClickData) {
  const path = notificationPath({
    resource_type: data.resource_type || "",
    resource_id: data.resource_id || "",
    facility_id: data.facility_id || "",
    payload: (data.payload as Record<string, string>) || {},
  });

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
