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

// Keep in sync with the identical constants in care_fe/src/service-worker.ts.
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
 * Handles notification click deep-linking. care_fe's SW navigates to
 * `{path}#notification_click={id}`, an opaque key into Cache Storage, for
 * both existing and new windows. Read on load and on `hashchange`, since a
 * same-document (hash-only) navigation doesn't rerun this module.
 */
export async function initNotificationClickListener() {
  const handleHash = () => void handleNotificationClickHash();
  window.addEventListener("hashchange", handleHash);
  await handleNotificationClickHash();
}

async function handleNotificationClickHash() {
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
