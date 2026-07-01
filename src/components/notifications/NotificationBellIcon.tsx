import { Bell } from "lucide-react";

import { useUnreadCount } from "@/api/useNotifications";

/**
 * Bell icon for the nav item that shows a `*` indicator
 * whenever there are unread notifications.
 */
export default function NotificationBellIcon() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const hasUnread = unreadCount > 0;

  return (
    <span className="relative inline-flex">
      <Bell className="h-3.5 w-4" />
      {hasUnread && (
        <span
          aria-label={`${unreadCount} unread notifications`}
          className="absolute -right-0.5 -top-0.5 inline-flex size-2"
        >
          <span className="absolute inline-flex size-full animate-pulse rounded-full bg-red-500" />
        </span>
      )}
    </span>
  );
}
