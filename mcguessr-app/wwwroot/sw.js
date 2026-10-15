// Minimaler Service Worker: macht die Seite als App installierbar, cached aber
// bewusst nichts - Code, Leaderboard und Bilder kommen immer frisch vom Server
// bzw. aus dem normalen Browser-Cache, dadurch gibt es keine veralteten Versionen.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
