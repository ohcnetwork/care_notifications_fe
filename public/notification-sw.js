// Service worker for receiving Web Push notifications
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Reference resolver — mirrors src/lib/notificationPath.ts
function notificationPath(data) {
  const resourceType = data.resource_type;
  const resourceId = data.resource_id;
  const facilityId = data.facility_id;
  const payload = data.payload || data;

  if (!facilityId) return null;

  switch (resourceType) {
    case "encounter":
      return payload.patient_id
        ? "/facility/" +
            facilityId +
            "/patient/" +
            payload.patient_id +
            "/encounter/" +
            resourceId +
            "/updates"
        : null;
    case "service_request":
      return "/facility/" + facilityId + "/service_requests/" + resourceId;
    case "diagnostic_report":
      return payload.patient_id
        ? "/facility/" +
            facilityId +
            "/patient/" +
            payload.patient_id +
            "/diagnostic_reports/" +
            resourceId
        : null;
    case "medication_stock":
      return payload.location_id
        ? "/facility/" +
            facilityId +
            "/locations/" +
            payload.location_id +
            "/inventory/summary"
        : null;
    default:
      return null;
  }
}

self.addEventListener("push", (event) => {
  console.log(
    "[sw] push received:",
    event.data ? event.data.text() : "(no data)",
  );
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "Care notification",
      body: event.data ? event.data.text() : "",
    };
  }

  const title = data.title || "Care notification";
  const options = {
    body: data.body || "",
    icon: "/icons/care-icon-192.png",
    badge: "/icons/care-badge-72.png",
    data: data,
    tag: data.resource_id || undefined,
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => console.log("[sw] showNotification OK"))
      .catch((err) => console.error("[sw] showNotification FAILED:", err)),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const deepLink = notificationPath(data);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (deepLink) {
          // Try to navigate an existing tab
          for (const client of clientList) {
            if ("navigate" in client) {
              client.navigate(deepLink);
              return client.focus();
            }
          }
          return self.clients.openWindow(deepLink);
        }

        // Fallback: focus existing tab or open notifications page
        for (const client of clientList) {
          const match = client.url.match(/\/facility\/([^/]+)/);
          if (match) {
            client.navigate("/facility/" + match[1] + "/notifications");
            return client.focus();
          }
        }
        return self.clients.openWindow("/");
      }),
  );
});
