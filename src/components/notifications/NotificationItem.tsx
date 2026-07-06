import { Bell } from "lucide-react";
import { navigate } from "raviger";

import { formatDistanceToNow } from "@/lib/dateUtils";
import {
  getNotificationHandler,
  resolveNotificationIcon,
  resolveNotificationLabel,
  resolveNotificationPath,
  runNotificationClickAction,
} from "@/lib/notificationRegistry";
import { cn } from "@/lib/utils";

import { useTranslation } from "@/hooks/useTranslation";

import { InAppNotification } from "@/types/notification";

export function getNotificationIcon(notification: InAppNotification) {
  return (
    resolveNotificationIcon(notification) ?? (
      <Bell className="size-4 text-gray-500" />
    )
  );
}

export function getResourceLabel(resourceType: string) {
  return resolveNotificationLabel(resourceType);
}

interface NotificationItemProps {
  notification: InAppNotification;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
}: NotificationItemProps) {
  const { t } = useTranslation();
  const isUnread = !notification.read_at;
  const deepLink = resolveNotificationPath(notification);
  const hasClickAction = !!getNotificationHandler(notification.resource_type)
    ?.onClick;

  const handleClick = () => {
    const handledByAction = runNotificationClickAction(notification);
    if (!handledByAction && !deepLink) return;
    if (isUnread) onMarkRead?.(notification.id);
    if (!handledByAction && deepLink) navigate(deepLink);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-2 border-b border-gray-100 p-2 transition-colors hover:bg-gray-50 sm:gap-3 sm:p-3 dark:border-gray-800 dark:hover:bg-gray-900",
        isUnread && "bg-blue-50/50 dark:bg-blue-950/20",
        (deepLink || hasClickAction) && "cursor-pointer",
      )}
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        {getNotificationIcon(notification)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "line-clamp-2 text-sm leading-tight",
              isUnread
                ? "font-semibold text-gray-900 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300",
            )}
          >
            {notification.title}
          </p>
          {isUnread && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        {notification.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {notification.body}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(notification.created_date)}
          </span>
          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
          <span className="text-xs text-gray-400">
            {t(getResourceLabel(notification.resource_type))}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isUnread) {
            onMarkRead?.(notification.id);
          } else {
            onMarkUnread?.(notification.id);
          }
        }}
        className="shrink-0 whitespace-nowrap rounded p-1 text-xs text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        title={isUnread ? t("mark_as_read") : t("mark_as_unread")}
      >
        {isUnread ? t("mark_read") : t("mark_unread")}
      </button>
    </div>
  );
}
