import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import { Bell, CheckCheck, Filter, Loader2 } from "lucide-react";
import { usePath } from "raviger";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { NotificationItem } from "@/components/notifications/NotificationItem";

import {
  useInfiniteNotifications,
  useMarkRead,
  useMarkUnread,
  useUnreadCount,
} from "@/api/useNotifications";
import { EventType, ResourceType } from "@/types/notification";

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All Events" },
  { value: EventType.SERVICE_REQUEST_RAISED, label: "Service Request Raised" },
  {
    value: EventType.DIAGNOSTIC_REPORT_READY,
    label: "Diagnostic Report Ready",
  },
  { value: EventType.ENCOUNTER_IP_CREATED, label: "IP Encounter Created" },
  { value: EventType.MEDICATION_STOCK_LOW, label: "Low Stock" },
  { value: EventType.MEDICATION_STOCK_NEAR_EXPIRY, label: "Near Expiry" },
  { value: EventType.BOOKING_CONFIRMATION, label: "Booking Confirmed" },
  { value: EventType.BOOKING_CANCELLATION, label: "Booking Cancelled" },
  { value: EventType.BOOKING_RESCHEDULE, label: "Booking Rescheduled" },
];

const RESOURCE_TYPE_OPTIONS = [
  { value: "", label: "All Resources" },
  { value: ResourceType.SERVICE_REQUEST, label: "Service Request" },
  { value: ResourceType.DIAGNOSTIC_REPORT, label: "Diagnostic Report" },
  { value: ResourceType.ENCOUNTER, label: "Encounter" },
  { value: ResourceType.MEDICATION_STOCK, label: "Medication Stock" },
  { value: ResourceType.BOOKING, label: "Booking" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<"all" | "unread" | "read">("unread");
  const [eventType, setEventType] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { ref, inView } = useInView();

  // Extract facilityId from URL: /facility/:facilityId/notifications
  const path = usePath();
  const facilityId = path?.match(/\/facility\/([^/]+)/)?.[1];

  const filters = {
    ...(tab === "unread" ? { unread: true } : {}),
    ...(tab === "read" ? { unread: false } : {}),
    ...(eventType ? { event_type: eventType } : {}),
    ...(resourceType ? { resource_type: resourceType } : {}),
    ...(facilityId ? { facility: facilityId } : {}),
  };

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteNotifications(filters);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markUnread = useMarkUnread();

  const notifications = data?.pages.flatMap((page) => page.results) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMarkRead = (id: string) => markRead.mutate({ ids: [id] });
  const handleMarkUnread = (id: string) => markUnread.mutate({ ids: [id] });
  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (unreadIds.length > 0) markRead.mutate({ ids: unreadIds });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-gray-700 dark:text-gray-300" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-1 size-4" />
            Filters
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-1 size-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
          <Select.Root value={eventType} onValueChange={setEventType}>
            <Select.Trigger className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
              <Select.Value placeholder="All Events" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 rounded-md border bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                <Select.Viewport>
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <Select.Item
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <Select.Root value={resourceType} onValueChange={setResourceType}>
            <Select.Trigger className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
              <Select.Value placeholder="All Resources" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 rounded-md border bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                <Select.Viewport>
                  {RESOURCE_TYPE_OPTIONS.map((opt) => (
                    <Select.Item
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          {(eventType || resourceType) && (
            <button
              onClick={() => {
                setEventType("");
                setResourceType("");
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <Tabs.Root
        value={tab}
        onValueChange={(v) => setTab(v as "all" | "unread" | "read")}
      >
        <Tabs.List className="mb-4 flex border-b border-gray-200 dark:border-gray-800">
          <Tabs.Trigger
            value="all"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              tab === "all"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            All
          </Tabs.Trigger>
          <Tabs.Trigger
            value="unread"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              tab === "unread"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="read"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              tab === "read"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            Read
          </Tabs.Trigger>
        </Tabs.List>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-3 size-12 text-gray-200 dark:text-gray-700" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tab === "unread"
                  ? "You're all caught up!"
                  : "No notifications yet"}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onMarkUnread={handleMarkUnread}
              />
            ))
          )}
        </div>

        {hasNextPage && (
          <div ref={ref} className="flex items-center justify-center py-4">
            {isFetchingNextPage ? (
              <Loader2 className="size-5 animate-spin text-gray-400" />
            ) : (
              <span className="text-xs text-gray-400">Scroll for more</span>
            )}
          </div>
        )}

        {!hasNextPage && notifications.length > 0 && (
          <p className="mt-3 text-center text-xs text-gray-400">
            Showing all {totalCount} notifications
          </p>
        )}
      </Tabs.Root>
    </div>
  );
}
