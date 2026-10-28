import { useSyncExternalStore } from 'react'
import { currentRoute, subscribe, type Route } from '../core/router'

let cachedHash: string | undefined
let cachedRoute: Route

function snapshot(): Route {
  if (window.location.hash !== cachedHash) {
    cachedHash = window.location.hash
    cachedRoute = currentRoute()
  }
  return cachedRoute
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot)
}
