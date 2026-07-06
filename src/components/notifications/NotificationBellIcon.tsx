import { Bell } from "lucide-react";
import { usePath } from "raviger";

import { useUnreadCount } from "@/api/useNotifications";

/**
 * Bell icon for the nav item that shows a `*` indicator
 * whenever there are unread notifications.
 */
export default function NotificationBellIcon() {
  const path = usePath();
  const facilityId = path?.match(/\/facility\/([^/]+)/)?.[1];

  const { data: unreadCount = 0 } = useUnreadCount(facilityId);
  const hasUnread = unreadCount > 0;

  return (
    <span className="care-notifications-fe-container relative inline-flex">
      <Bell className={`h-3.5 w-4 ${hasUnread ? "animate-bell-shake" : ""}`} />
      {hasUnread && (
        <span aria-label={`${unreadCount} unread notifications`}>
          <span className="absolute inline-flex size-1.5 right-0.5 -top-0.5 animate-bell-pulse rounded-full bg-red-500" />
        </span>
      )}
    </span>
  );
}
