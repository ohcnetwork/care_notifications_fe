import { Bell } from "lucide-react";

import NotificationBellIcon from "./components/notifications/NotificationBellIcon";
import routes from "./routes";

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
