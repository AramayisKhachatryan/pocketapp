// Every mini-app is one entry here. To build one: create src/apps/<id>/index.tsx
// (default-export a component), add `load` below, and set status to 'ready'.
import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen, Briefcase, CalendarCheck, Divide, Feather, Layers, Repeat, Sigma, Timer,
} from 'lucide-react'

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
  { id: 'quick-capture', name: 'Quick Capture', subtitle: 'Notes and to-dos in one tap', icon: Feather, accent: '#c98a1b', status: 'planned' },
  { id: 'problem-log', name: 'Problem Log', subtitle: 'Problems, mistakes, insights', icon: Sigma, accent: '#3d5fb0', status: 'planned' },
  { id: 'flashcards', name: 'Flashcards', subtitle: 'Spaced repetition for formulas', icon: Layers, accent: '#23897f', status: 'planned' },
  { id: 'mental-math', name: 'Mental Math', subtitle: 'Timed arithmetic drills', icon: Divide, accent: '#7656c4', status: 'ready', load: () => import('./apps/mental-math') },
  { id: 'focus-timer', name: 'Focus Timer', subtitle: 'Deep-work sessions', icon: Timer, accent: '#c4513f', status: 'planned' },
  { id: 'habit-tracker', name: 'Habit Tracker', subtitle: 'Daily habits and streaks', icon: CalendarCheck, accent: '#4b8a3a', status: 'planned' },
  { id: 'applications', name: 'Application Tracker', subtitle: 'Quant and ML roles by stage', icon: Briefcase, accent: '#47698c', status: 'planned' },
  { id: 'subscriptions', name: 'Subscriptions', subtitle: 'Recurring costs and renewals', icon: Repeat, accent: '#ad4677', status: 'planned' },
  { id: 'reading', name: 'Reading Tracker', subtitle: 'Papers and books, with notes', icon: BookOpen, accent: '#98693b', status: 'planned' },
]

export function findMiniApp(id: string): MiniApp | undefined {
  return miniApps.find((app) => app.id === id)
}
