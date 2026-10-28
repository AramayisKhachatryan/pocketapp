// Hash routing, framework-free. Routes: #/  and  #/app/<id>
export type Route =
  | { name: 'home' }
  | { name: 'app'; id: string }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  const match = path.match(/^\/app\/([\w-]+)\/?$/)
  return match ? { name: 'app', id: match[1] } : { name: 'home' }
}

export function hrefFor(route: Route): string {
  return route.name === 'app' ? `#/app/${route.id}` : '#/'
}

/** Depth in the navigation stack; used to pick the transition direction. */
export function depthOf(route: Route): number {
  return route.name === 'home' ? 0 : 1
}

let inAppNavigations = 0
window.addEventListener('hashchange', () => inAppNavigations++)

export function currentRoute(): Route {
  return parseHash(window.location.hash)
}

export function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

/**
 * Back to the previous screen. If the app was opened directly on a deep link
 * there is no in-app history, so go home instead of leaving the app.
 */
export function goBack(): void {
  if (inAppNavigations > 0) window.history.back()
  else window.location.replace(hrefFor({ name: 'home' }))
}
