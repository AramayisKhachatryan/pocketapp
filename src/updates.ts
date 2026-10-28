// App updates. A new deploy's service worker takes over as soon as it has installed
// (skipWaiting + clientsClaim in vite.config.ts), so nothing a page does, or fails to
// do, can leave it waiting. The open page keeps running the version it loaded and
// reloads into the new one once the user is on the home screen, so an update never
// interrupts a mini-app mid-use.
import { currentRoute, subscribe } from './core/router'

export function setupUpdates(): void {
  // A deploy can delete lazy chunks this page has not loaded yet. Reload into the new version.
  window.addEventListener('vite:preloadError', () => window.location.reload())

  if (!('serviceWorker' in navigator)) return
  const sw = navigator.serviceWorker

  let controller = sw.controller
  let updated = false
  const applyIfHome = () => {
    if (updated && currentRoute().name === 'home') window.location.reload()
  }

  sw.addEventListener('controllerchange', () => {
    // On a first visit the first worker claiming the page is not an update.
    if (controller) updated = true
    controller = sw.controller
    applyIfHome()
  })
  subscribe(applyIfHome)

  sw.register('./sw.js', { scope: './' })
    .then((registration) => {
      // iOS resumes a Home Screen app without reloading it, so also check on resume.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {})
      })
    })
    .catch(() => {}) // no service worker in dev, or offline on a first visit
}
