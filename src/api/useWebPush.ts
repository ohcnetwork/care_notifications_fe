import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mutate, query } from "@/lib/request";
import { getOrRegisterServiceWorker } from "@/lib/serviceWorker";

import notificationRoutes from "./routes";

const WEB_PUSH_QUERY_KEY = "web_push_subscriptions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useVapidPublicKey() {
  return useQuery({
    queryKey: [WEB_PUSH_QUERY_KEY, "vapid_public_key"],
    queryFn: query(notificationRoutes.getVapidPublicKey),
    staleTime: Infinity,
  });
}

export function useWebPushSubscriptions() {
  return useQuery({
    queryKey: [WEB_PUSH_QUERY_KEY],
    queryFn: query(notificationRoutes.listWebPushSubscriptions),
  });
}

export function useSubscribeWebPush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutate(notificationRoutes.createWebPushSubscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WEB_PUSH_QUERY_KEY] });
    },
  });
}

export function useUnsubscribeWebPush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutate(notificationRoutes.unsubscribeWebPush),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WEB_PUSH_QUERY_KEY] });
    },
  });
}

export type PushPermissionState =
  "granted" | "denied" | "default" | "unsupported";

export function getPushPermissionState(): PushPermissionState {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  return Notification.permission as PushPermissionState;
}

export async function subscribeToPush(vapidPublicKey: string) {
  const registration = await getOrRegisterServiceWorker();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  const json = subscription.toJSON();
  return {
    endpoint: json.endpoint!,
    keys: {
      p256dh: json.keys!.p256dh!,
      auth: json.keys!.auth!,
    },
  };
}

export async function getCurrentPushSubscription() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const registration = await getOrRegisterServiceWorker();
    return registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}
