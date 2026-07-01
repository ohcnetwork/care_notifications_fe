import { HttpMethod, PaginatedResponse, apiRoutes } from "@/lib/request";

import {
  InAppNotification,
  MarkReadRequest,
  MarkReadResponse,
  VapidPublicKeyResponse,
  WebPushSubscription,
  WebPushSubscriptionRequest,
  WebPushUnsubscribeRequest,
  WebPushUnsubscribeResponse,
} from "@/types/notification";

const notificationRoutes = apiRoutes({
  listNotifications: {
    method: HttpMethod.GET,
    path: "/api/care_notifications/in_app_notifications/",
    TResponse: {} as PaginatedResponse<InAppNotification>,
  },
  getNotification: {
    method: HttpMethod.GET,
    path: "/api/care_notifications/in_app_notifications/{external_id}/",
    TResponse: {} as InAppNotification,
  },
  markRead: {
    method: HttpMethod.POST,
    path: "/api/care_notifications/in_app_notifications/mark_read/",
    TRequest: {} as MarkReadRequest,
    TResponse: {} as MarkReadResponse,
  },
  markUnread: {
    method: HttpMethod.POST,
    path: "/api/care_notifications/in_app_notifications/mark_unread/",
    TRequest: {} as MarkReadRequest,
    TResponse: {} as MarkReadResponse,
  },
  listWebPushSubscriptions: {
    method: HttpMethod.GET,
    path: "/api/care_notifications/web_push_subscriptions/",
    TResponse: {} as PaginatedResponse<WebPushSubscription>,
  },
  createWebPushSubscription: {
    method: HttpMethod.POST,
    path: "/api/care_notifications/web_push_subscriptions/",
    TRequest: {} as WebPushSubscriptionRequest,
    TResponse: {} as WebPushSubscription,
  },
  unsubscribeWebPush: {
    method: HttpMethod.POST,
    path: "/api/care_notifications/web_push_subscriptions/unsubscribe/",
    TRequest: {} as WebPushUnsubscribeRequest,
    TResponse: {} as WebPushUnsubscribeResponse,
  },
  getVapidPublicKey: {
    method: HttpMethod.GET,
    path: "/api/care_notifications/web_push_subscriptions/vapid_public_key/",
    TResponse: {} as VapidPublicKeyResponse,
  },
});

export default notificationRoutes;
