// Every mini-app is one entry here. To build one: create src/apps/<id>/index.tsx
// (default-export a component), add `load` below, and set status to 'ready'.
import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Divide, Gamepad2 } from 'lucide-react'

export type MiniAppStatus = 'planned' | 'ready'

export interface MiniApp {
  /** URL-safe, stable; also the storage namespace. Route is #/app/<id>. */
  id: string
  name: string
  subtitle: string
  icon: LucideIcon
  /** Mid-tone hex that reads on both light and dark backgrounds. */
  accent: string
  status: MiniAppStatus
  /** Lazy import of the mini-app's folder. Absent for 'planned' apps. */
  load?: () => Promise<{ default: ComponentType }>
}

export const miniApps: MiniApp[] = [
  { id: 'mental-math', name: 'Mental Math', subtitle: 'Timed arithmetic drills', icon: Divide, accent: '#7656c4', status: 'ready', load: () => import('./apps/mental-math') },
  { id: 'games', name: 'Games', subtitle: 'Small games to play', icon: Gamepad2, accent: '#c4513f', status: 'ready', load: () => import('./apps/games') },
]

export function findMiniApp(id: string): MiniApp | undefined {
  return miniApps.find((app) => app.id === id)
}
