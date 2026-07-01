let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

export async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers not supported");
  }

  if (registrationPromise) return registrationPromise;

  registrationPromise = (async () => {
    // care_fe already registers a PWA service worker at root scope.
    // We just grab the existing registration to subscribe to push.
    // The push/click handling is in care_fe's service-worker.ts.
    const reg = await navigator.serviceWorker.ready;
    return reg;
  })();

  return registrationPromise;
}
