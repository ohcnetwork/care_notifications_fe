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

// care_fe/src/service-worker.ts — used to hand off notification click
// payloads via Cache Storage instead of the URL, so PHI never ends up in the
// browser history.
const NOTIFICATION_CLICK_CACHE = "care-notification-click-data-v1";
const notificationClickCacheKey = (id: string) =>
  `/__notification_click__/${id}`;

async function consumeNotificationClickData(
  id: string,
): Promise<NotificationClickData | null> {
  const cache = await caches.open(NOTIFICATION_CLICK_CACHE);
  const key = notificationClickCacheKey(id);
  const response = await cache.match(key);
  if (!response) return null;
  await cache.delete(key);
  return (await response.json()) as NotificationClickData;
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
 * 2. App closed: the SW opens /facility/{id}/notifications#notification_click={id},
 *    where {id} is an opaque key into Cache Storage (not the payload itself,
 *    so PHI never ends up in the URL or browser history). The id is read
 *    once at plugin load, the payload fetched from the cache, and the app
 *    redirected.
 */
export async function initNotificationClickListener() {
  // Case 1: live message from the SW while the app is open
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type !== "NOTIFICATION_CLICK") return;
    resolveAndNavigate(event.data.data || {});
  });

  // Case 2: opaque id set by the SW on a fresh window
  const hash = window.location.hash;
  if (!hash.includes("notification_click=")) return;

  const id = hash.split("notification_click=")[1];

  // Clear the hash immediately to avoid re-triggering on refresh
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );

  if (!id) return;

  try {
    const data = await consumeNotificationClickData(id);
    if (data) resolveAndNavigate(data);
  } catch (err) {
    console.warn("Failed to resolve notification click data", err);
  }
}
