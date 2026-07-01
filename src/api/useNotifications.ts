import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { PaginatedResponse, mutate, query } from "@/lib/request";

import { InAppNotification, NotificationFilters } from "@/types/notification";

import notificationRoutes from "./routes";

export const NOTIFICATIONS_QUERY_KEY = "in_app_notifications";

const NOTIFICATIONS_PAGE_SIZE = 36;

function getPollInterval(): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (window as any).__CARE_PLUGIN_RUNTIME__?.meta?.[
    "care_notifications_fe"
  ];
  return (
    Number(meta?.config?.NOTIFICATION_POLL_INTERVAL_IN_SEC) * 1000 || 30_000
  );
}

function buildQueryParams(
  filters: NotificationFilters,
): Record<string, string | number | boolean | undefined> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    ordering: filters.ordering ?? "-created_date",
  };

  if (filters.event_type) queryParams.event_type = filters.event_type;
  if (filters.resource_type) queryParams.resource_type = filters.resource_type;
  if (filters.resource_id) queryParams.resource_id = filters.resource_id;
  if (filters.facility) queryParams.facility = filters.facility;
  if (filters.unread !== undefined) queryParams.unread = filters.unread;

  return queryParams;
}

export function useNotifications(filters: NotificationFilters = {}) {
  const queryParams = buildQueryParams(filters);
  if (filters.limit) queryParams.limit = filters.limit;
  if (filters.offset) queryParams.offset = filters.offset;

  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, queryParams],
    queryFn: query(notificationRoutes.listNotifications, {
      queryParams,
      silent: true,
    }),
    refetchInterval: getPollInterval(),
  });
}

export function useInfiniteNotifications(filters: NotificationFilters = {}) {
  const baseQueryParams = buildQueryParams(filters);

  return useInfiniteQuery<PaginatedResponse<InAppNotification>>({
    queryKey: [NOTIFICATIONS_QUERY_KEY, "infinite", baseQueryParams],
    queryFn: async ({ pageParam = 0, signal }) => {
      const response = await query(notificationRoutes.listNotifications, {
        queryParams: {
          ...baseQueryParams,
          limit: NOTIFICATIONS_PAGE_SIZE,
          offset: pageParam as number,
        },
        silent: true,
      })({ signal });
      return response as PaginatedResponse<InAppNotification>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * NOTIFICATIONS_PAGE_SIZE;
      return currentOffset < lastPage.count ? currentOffset : null;
    },
    refetchInterval: getPollInterval(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, "unread_count"],
    queryFn: query(notificationRoutes.listNotifications, {
      queryParams: { unread: true, limit: 1 },
      silent: true,
    }),
    refetchInterval: getPollInterval(),
    select: (data: { count: number }) => data.count,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutate(notificationRoutes.markRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
}

export function useMarkUnread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutate(notificationRoutes.markUnread),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
}
