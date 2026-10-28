// Session records and the stats shown after a run. Plain TS, no React or DOM.
import { storage, type StoredRecord } from '../../core/storage'
import type { DrillId } from './drills'

export interface Attempt {
  prompt: string
  answer: string
  kind: string
  /** Time from the problem appearing to it being solved or skipped. */
  ms: number
  skipped?: boolean
}

export interface Session extends StoredRecord {
  drill: DrillId
  /** Length of the run; scores are only comparable at equal length. */
  seconds: number
  /** Problems solved (skips don't count). */
  score: number
  startedAt: number
  attempts: Attempt[]
}

export interface Prefs extends StoredRecord {
  drill: DrillId
  seconds: number
}

export const DURATIONS = [60, 120, 180, 300] as const
export const DEFAULT_PREFS = { drill: 'standard', seconds: 120 } as const satisfies Omit<Prefs, 'id' | 'updatedAt'>

export const sessions = storage.collection<Session>('mental-math', 'sessions')
const prefs = storage.collection<Prefs>('mental-math', 'prefs')
const PREFS_ID = 'last'

export async function loadPrefs(): Promise<Pick<Prefs, 'drill' | 'seconds'>> {
  return (await prefs.get(PREFS_ID)) ?? DEFAULT_PREFS
}

export function savePrefs(drill: DrillId, seconds: number): Promise<Prefs> {
  return prefs.put({ id: PREFS_ID, drill, seconds })
}

/** Sessions for one drill and length, oldest first. */
export function historyFor(all: Session[], drill: DrillId, seconds: number): Session[] {
  return all.filter((s) => s.drill === drill && s.seconds === seconds).sort((a, b) => a.startedAt - b.startedAt)
}

export function bestScore(history: Session[]): number | undefined {
  return history.length ? Math.max(...history.map((s) => s.score)) : undefined
}

export interface KindStat {
  kind: string
  count: number
  meanMs: number
}

export interface Summary {
  solved: number
  skipped: number
  /** Mean time per solved problem. */
  meanMs: number
  /** Slowest solved problems, slowest first. */
  slowest: Attempt[]
  /** Mean time per problem type, slowest first. Only when the drill mixes types. */
  byKind: KindStat[]
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

export function summarize(session: Pick<Session, 'attempts'>, slowestCount = 5): Summary {
  const solved = session.attempts.filter((a) => !a.skipped)
  const kinds = new Map<string, number[]>()
  for (const a of solved) kinds.set(a.kind, [...(kinds.get(a.kind) ?? []), a.ms])
  const byKind = [...kinds]
    .map(([kind, ms]) => ({ kind, count: ms.length, meanMs: mean(ms) }))
    .sort((a, b) => b.meanMs - a.meanMs)
  return {
    solved: solved.length,
    skipped: session.attempts.length - solved.length,
    meanMs: mean(solved.map((a) => a.ms)),
    slowest: [...solved].sort((a, b) => b.ms - a.ms).slice(0, slowestCount),
    byKind: byKind.length > 1 ? byKind : [],
  }
}

/** "1.8 s" style, one decimal. */
export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`
}

/** "2 min" or "1:30". */
export function formatDuration(seconds: number): string {
  return seconds % 60 === 0 ? `${seconds / 60} min` : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
