import { BellRing, Loader2, MonitorSmartphone } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  PushPermissionState,
  getCurrentPushSubscription,
  getPushPermissionState,
  subscribeToPush,
  useSubscribeWebPush,
  useUnsubscribeWebPush,
  useVapidPublicKey,
  useWebPushSubscriptions,
} from "@/api/useWebPush";

export function WebPushSettings() {
  const [permissionState, setPermissionState] = useState<PushPermissionState>(
    getPushPermissionState,
  );
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const { data: vapidData } = useVapidPublicKey();
  const { data: subscriptions } = useWebPushSubscriptions();
  const subscribe = useSubscribeWebPush();
  const unsubscribe = useUnsubscribeWebPush();

  const isSubscribed =
    currentEndpoint != null &&
    subscriptions?.results.some((s) => s.endpoint === currentEndpoint);

  useEffect(() => {
    getCurrentPushSubscription().then((sub) => {
      setCurrentEndpoint(sub?.endpoint ?? null);
    });
  }, []);

  const handleEnable = async () => {
    if (!vapidData?.public_key) return;
    setIsToggling(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PushPermissionState);
      if (permission !== "granted") {
        setIsToggling(false);
        return;
      }

      const subscriptionData = await subscribeToPush(vapidData.public_key);
      subscribe.mutate(subscriptionData);
      setCurrentEndpoint(subscriptionData.endpoint);
    } catch (err) {
      console.error("Failed to subscribe to push:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDisable = async () => {
    if (!currentEndpoint) return;
    setIsToggling(true);
    try {
      unsubscribe.mutate({ endpoint: currentEndpoint });
      const sub = await getCurrentPushSubscription();
      if (sub) await sub.unsubscribe();
      setCurrentEndpoint(null);
    } catch (err) {
      console.error("Failed to unsubscribe from push:", err);
    } finally {
      setIsToggling(false);
    }
  };

  if (permissionState === "unsupported") {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <MonitorSmartphone className="size-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Push Notifications
            </p>
            <p className="text-xs text-gray-500">
              Not supported in this browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              isSubscribed
                ? "bg-green-100 dark:bg-green-900"
                : "bg-gray-100 dark:bg-gray-800",
            )}
          >
            <BellRing
              className={cn(
                "size-5",
                isSubscribed
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500",
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Push Notifications
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isSubscribed
                ? "Receiving push notifications on this device"
                : permissionState === "denied"
                  ? "Blocked by browser — allow in site settings"
                  : "Get notified even when Care is not open"}
            </p>
          </div>
        </div>

        {permissionState !== "denied" && (
          <Button
            variant={isSubscribed ? "outline" : "primary"}
            size="sm"
            disabled={isToggling}
            onClick={isSubscribed ? handleDisable : handleEnable}
          >
            {isToggling && <Loader2 className="mr-1 size-3 animate-spin" />}
            {isSubscribed ? "Disable" : "Enable"}
          </Button>
        )}
      </div>

      {subscriptions && subscriptions.results.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
          <p className="mb-1 text-xs font-medium text-gray-500">
            Active devices: {subscriptions.results.length}
          </p>
        </div>
      )}
    </div>
  );
}
