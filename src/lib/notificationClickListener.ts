import { notificationPath } from "./notificationPath";

/**
 * Reads notification click data from the URL hash (set by care_fe's SW),
 * clears the hash, and navigates to the resolved deep-link path.
 *
 * The SW navigates to /facility/{id}/notifications#notification_click={encoded_data}
 * Returns true if a redirect was performed.
 */
export function consumeNotificationClickHash(): boolean {
  const hash = window.location.hash;
  if (!hash.includes("notification_click=")) return false;

  try {
    const encoded = hash.split("notification_click=")[1];
    if (!encoded) return false;

    const data = JSON.parse(decodeURIComponent(encoded));

    const path = notificationPath({
      resource_type: data.resource_type || "",
      resource_id: data.resource_id || "",
      facility_id: data.facility_id || "",
      payload: data.payload || {},
    });

    // Clear the hash to avoid re-triggering on refresh
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    if (path) {
      window.location.replace(path);
      return true;
    }
  } catch {
    // silently ignore malformed notification data
  }
  return false;
}

/**
 * Consumes any notification click data already present in the URL and keeps
 * listening for hash changes. The SW's client.navigate() may only change the
 * hash when the app is already open (no full reload), so a one-time check at
 * module load is not enough.
 */
export function initNotificationClickListener() {
  consumeNotificationClickHash();
  window.addEventListener("hashchange", () => consumeNotificationClickHash());
}
