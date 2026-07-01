import { Bell } from "lucide-react";

import NotificationBellIcon from "./components/notifications/NotificationBellIcon";
import { initNotificationClickListener } from "./lib/notificationClickListener";
import routes from "./routes";

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
