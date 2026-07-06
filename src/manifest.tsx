import { Bell } from "lucide-react";

import NotificationBellIcon from "./components/notifications/NotificationBellIcon";
import { registerBuiltinNotificationHandlers } from "./lib/builtinNotificationHandlers";
import { initNotificationClickListener } from "./lib/notificationClickListener";
import { initNotificationRegistryBridge } from "./lib/notificationRegistry";
import routes from "./routes";

// Set up the handler registry (built-ins + bridge for other plugins)
registerBuiltinNotificationHandlers();
initNotificationRegistryBridge();

// Register the SW message listener for push notification deep-linking
initNotificationClickListener();

const manifest = {
  plugin: "care-notifications-fe",
  routes,
  extends: [],
  components: {},
  navItems: [
    {
      name: "Notifications",
      url: "notifications",
      icon: <NotificationBellIcon />,
    },
  ],
  userNavItems: [
    {
      name: "Notifications",
      url: "notifications",
      icon: <Bell />,
    },
  ],
  devices: [],
};

export default manifest;
