import { Bell } from "lucide-react";

import { WebPushSettings } from "@/components/notifications/WebPushSettings";

import { useTranslation } from "@/hooks/useTranslation";

export default function WebPushSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Bell className="size-6 text-gray-700 dark:text-gray-300" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("notification_settings")}
        </h1>
      </div>
      <WebPushSettings />
    </div>
  );
}
