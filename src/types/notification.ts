export enum ResourceType {
  BOOKING = "booking",
  DIAGNOSTIC_REPORT = "diagnostic_report",
  SERVICE_REQUEST = "service_request",
  ENCOUNTER = "encounter",
  MEDICATION_STOCK = "medication_stock",
}

export enum EventType {
  BOOKING_CONFIRMATION = "booking_confirmation",
  BOOKING_REMINDER = "booking_reminder",
  BOOKING_CANCELLATION = "booking_cancellation",
  BOOKING_RESCHEDULE = "booking_reschedule",
  DIAGNOSTIC_REPORT_READY = "diagnostic_report_ready",
  SERVICE_REQUEST_RAISED = "service_request_raised",
  ENCOUNTER_IP_CREATED = "encounter_ip_created",
  MEDICATION_STOCK_NEAR_EXPIRY = "medication_stock_near_expiry",
  MEDICATION_STOCK_LOW = "medication_stock_low",
}

export interface NotificationRecipient {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
}

export interface InAppNotification {
  id: string;
  event_type: EventType;
  resource_type: ResourceType;
  resource_id: string;
  facility_id: string;
  title: string;
  body: string;
  payload: Record<string, string>;
  read_at: string | null;
  created_date: string;
  modified_date: string;
  recipient: NotificationRecipient | null;
}

export interface NotificationFilters {
  event_type?: string;
  resource_type?: string;
  resource_id?: string;
  facility?: string;
  unread?: boolean;
  offset?: number;
  limit?: number;
  ordering?: string;
}

export interface MarkReadRequest {
  ids: string[];
}

export interface MarkReadResponse {
  updated: number;
}

// Web Push types
export interface WebPushSubscription {
  id: string;
  endpoint: string;
  created_date: string;
}

export interface WebPushSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebPushUnsubscribeRequest {
  endpoint: string;
}

export interface WebPushUnsubscribeResponse {
  deleted: number;
}

export interface VapidPublicKeyResponse {
  public_key: string;
}
