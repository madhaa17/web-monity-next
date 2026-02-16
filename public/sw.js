// Minimal service worker for PWA installability.
// Does not cache pages/API to avoid stale auth or data.
// Add push and notificationclick listeners here when enabling Web Push.
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
