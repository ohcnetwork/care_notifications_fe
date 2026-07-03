import { InAppNotification } from "@/types/notification";

type NotificationTarget = {
  resource_type: string;
  resource_id: string;
  facility_id: string;
  payload?: Record<string, string>;
};

/**
 * Resolves a notification to a deep-link path.
 * Shared by the inbox click handler AND the service worker's notificationclick.
 */
export function notificationPath(
  n: NotificationTarget | InAppNotification,
): string | null {
  const { resource_type, resource_id, facility_id } = n;
  const payload = n.payload ?? {};

  if (!facility_id) return null;

  switch (resource_type) {
    case "encounter":
      return payload.patient_id
        ? `/facility/${facility_id}/patient/${payload.patient_id}/encounter/${resource_id}/updates`
        : null;
    case "service_request":
      return `/facility/${facility_id}/service_requests/${resource_id}`;
    case "diagnostic_report":
      return payload.patient_id
        ? `/facility/${facility_id}/patient/${payload.patient_id}/diagnostic_reports/${resource_id}`
        : null;
    case "medication_stock":
      return payload.location_id
        ? `/facility/${facility_id}/locations/${payload.location_id}/inventory/summary`
        : null;
    default:
      return null;
  }
}
