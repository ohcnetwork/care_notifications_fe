import {
  Bell,
  CalendarCheck,
  CalendarX,
  ClipboardList,
  FlaskConical,
  Hospital,
  PackageOpen,
  Timer,
} from "lucide-react";

import { EventType } from "@/types/notification";

import {
  NotificationHandler,
  registerNotificationHandlers,
} from "./notificationRegistry";

/**
 * Handlers for the notification types shipped by care itself, registered
 * through the same registry other plugins use.
 */
const builtinHandlers: NotificationHandler[] = [
  {
    resourceType: "booking",
    label: "booking",
    defaultIcon: <Bell className="size-4 text-blue-600" />,
    icons: {
      [EventType.BOOKING_CONFIRMATION]: (
        <CalendarCheck className="size-4 text-green-600" />
      ),
      [EventType.BOOKING_CANCELLATION]: (
        <CalendarX className="size-4 text-red-600" />
      ),
      [EventType.BOOKING_RESCHEDULE]: (
        <CalendarCheck className="size-4 text-yellow-600" />
      ),
      [EventType.BOOKING_REMINDER]: <Bell className="size-4 text-blue-600" />,
    },
  },
  {
    resourceType: "encounter",
    label: "encounter",
    defaultIcon: <Hospital className="size-4 text-purple-600" />,
    path: ({ facility_id, resource_id, payload }) =>
      facility_id && payload?.patient_id
        ? `/facility/${facility_id}/patient/${payload.patient_id}/encounter/${resource_id}/updates`
        : null,
  },
  {
    resourceType: "service_request",
    label: "service_request",
    defaultIcon: <ClipboardList className="size-4 text-blue-600" />,
    path: ({ facility_id, resource_id }) =>
      facility_id
        ? `/facility/${facility_id}/service_requests/${resource_id}`
        : null,
  },
  {
    resourceType: "diagnostic_report",
    label: "diagnostic_report",
    defaultIcon: <FlaskConical className="size-4 text-green-600" />,
    path: ({ facility_id, resource_id, payload }) =>
      facility_id && payload?.patient_id
        ? `/facility/${facility_id}/patient/${payload.patient_id}/diagnostic_reports/${resource_id}`
        : null,
  },
  {
    resourceType: "medication_stock",
    label: "medication_stock",
    icons: {
      [EventType.MEDICATION_STOCK_LOW]: (
        <PackageOpen className="size-4 text-red-600" />
      ),
      [EventType.MEDICATION_STOCK_NEAR_EXPIRY]: (
        <Timer className="size-4 text-orange-600" />
      ),
    },
    path: ({ facility_id, payload }) =>
      facility_id && payload?.location_id
        ? `/facility/${facility_id}/locations/${payload.location_id}/inventory/summary`
        : null,
  },
];

export function registerBuiltinNotificationHandlers(): void {
  registerNotificationHandlers(builtinHandlers);
}
