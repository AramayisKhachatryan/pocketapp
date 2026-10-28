// App updates. A new deploy installs a new service worker in the background; it
// waits until the user is on the home screen, then the page reloads into it. That
// way an update never interrupts a mini-app mid-use, and the old version keeps
// serving its own lazy chunks until then.
import { registerSW } from 'virtual:pwa-register'
import { currentRoute, subscribe } from './core/router'

export function setupUpdates(): void {
  let waiting = false
  const applyIfHome = () => {
    if (waiting && currentRoute().name === 'home') void updateSW(true)
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      waiting = true
      applyIfHome()
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // iOS resumes a Home Screen app without reloading it, so also check on resume.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {})
      })
    },
  })

  subscribe(applyIfHome)

  // Before the service worker controls the page (first visit), a deploy can delete
  // the old version's lazy chunks while this page still needs them. Reload into the new one.
  window.addEventListener('vite:preloadError', () => window.location.reload())
}
