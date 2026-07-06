import type { ReactNode } from "react";

/**
 * Minimal shape a handler receives. `facility_id` is optional — not every
 * notification is scoped to a facility.
 */
export interface NotificationTarget {
  resource_type: string;
  resource_id: string;
  facility_id?: string | null;
  event_type?: string;
  payload?: Record<string, string>;
}

/**
 * A handler contributed by a plugin for one `resource_type`.
 */
export interface NotificationHandler {
  /** The `resource_type` this handler owns (e.g. "encounter", "abdm_consent"). */
  resourceType: string;
  /** Resolves a deep-link path for a notification, or null if not linkable. */
  path?: (n: NotificationTarget) => string | null;
  /**
   * Arbitrary click action (e.g. open an in-app call UI). Takes priority
   * over `path`. Return false to fall through to `path`/default behavior.
   */
  onClick?: (n: NotificationTarget) => boolean | void;
  /** Icons keyed by `event_type`. */
  icons?: Record<string, ReactNode>;
  /** Fallback icon for this resource type when no event-specific icon matches. */
  defaultIcon?: ReactNode;
  /** i18n key for the resource label. Defaults to the resourceType itself. */
  label?: string;
}

const registry = new Map<string, NotificationHandler>();
const registrationListeners = new Set<(resourceType: string) => void>();

export function registerNotificationHandlers(
  handlers: NotificationHandler[],
): void {
  for (const handler of handlers) {
    registry.set(handler.resourceType, handler);
    registrationListeners.forEach((cb) => cb(handler.resourceType));
  }
}

/**
 * Resolves once a handler for `resourceType` is registered, or after
 * `timeoutMs`. Useful for deep-link clicks that may arrive before all
 * plugins (loaded in parallel by care_fe) have registered their handlers.
 */
export function waitForNotificationHandler(
  resourceType: string,
  timeoutMs = 5000,
): Promise<NotificationHandler | undefined> {
  const existing = registry.get(resourceType);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const listener = (registered: string) => {
      if (registered !== resourceType) return;
      cleanup();
      resolve(registry.get(resourceType));
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve(undefined);
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      registrationListeners.delete(listener);
    };
    registrationListeners.add(listener);
  });
}

export function getNotificationHandler(
  resourceType: string,
): NotificationHandler | undefined {
  return registry.get(resourceType);
}

/**
 * Resolves a notification to a deep-link path via the registered handler.
 * Shared by the inbox click handler AND the SW click listener (which runs
 * in the app window, where the registry is available).
 */
export function resolveNotificationPath(n: NotificationTarget): string | null {
  return registry.get(n.resource_type)?.path?.(n) ?? null;
}

/**
 * Runs the handler's custom `onClick` if present. Returns true when the
 * click was fully handled (caller should not navigate).
 */
export function runNotificationClickAction(n: NotificationTarget): boolean {
  const handler = registry.get(n.resource_type);
  if (!handler?.onClick) return false;
  return handler.onClick(n) !== false;
}

export function resolveNotificationIcon(n: NotificationTarget): ReactNode {
  const handler = registry.get(n.resource_type);
  if (!handler) return null;
  return (
    (n.event_type && handler.icons?.[n.event_type]) ??
    handler.defaultIcon ??
    null
  );
}

export function resolveNotificationLabel(resourceType: string): string {
  return registry.get(resourceType)?.label ?? resourceType;
}

/**
 * Global bridge so other plugins (separate bundles that can't import this
 * module instance) can contribute handlers regardless of load order:
 *
 *   (window.__CARE_NOTIFICATION_HANDLERS__ ||= []).push(...handlers);
 */
declare global {
  interface Window {
    __CARE_NOTIFICATION_HANDLERS__?: Pick<NotificationHandler[], "push">;
  }
}

export function initNotificationRegistryBridge(): void {
  // Drain anything queued before this plugin loaded
  const queued = window.__CARE_NOTIFICATION_HANDLERS__;
  if (Array.isArray(queued)) {
    registerNotificationHandlers(queued);
  }
  // From now on, pushes register immediately
  window.__CARE_NOTIFICATION_HANDLERS__ = {
    push: (...handlers: NotificationHandler[]) => {
      registerNotificationHandlers(handlers);
      return handlers.length;
    },
  };
}
