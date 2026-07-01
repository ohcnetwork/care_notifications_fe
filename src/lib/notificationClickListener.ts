import { notificationPath } from "./notificationPath";

/**
 * Reads notification click data from the URL hash (set by care_fe's SW)
 * and navigates to the resolved deep-link path.
 *
 * The SW navigates to /facility/{id}/notifications#notification_click={encoded_data}
 * This function picks it up, resolves the deep-link, and redirects.
 */
export function initNotificationClickListener() {
  const hash = window.location.hash;
  if (!hash.includes("notification_click=")) return;

  try {
    const encoded = hash.split("notification_click=")[1];
    if (!encoded) return;

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
    }
  } catch {
    // silently ignore malformed notification data
  }
}
