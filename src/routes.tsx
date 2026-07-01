import { lazy } from "react";

const NotificationsPage = lazy(
  () => import("@/components/notifications/NotificationsPage"),
);

const WebPushSettingsPage = lazy(
  () => import("@/components/notifications/WebPushSettingsPage"),
);

const routes = {
  "/facility/:facilityId/notifications": () => <NotificationsPage />,
  "/facility/:facilityId/users/:user/notifications": () => (
    <WebPushSettingsPage />
  ),
};

export default routes;
