import { useEffect, useReducer, useRef, useState } from 'react'
import { applyKey, isCorrect, nextProblem, type Drill, type Problem } from './drills'
import type { Attempt } from './sessions'
import { Keypad } from './Keypad'

interface State {
  problem: Problem
  input: string
  shownAt: number
  attempts: Attempt[]
}

type Action = { type: 'key'; key: string; now: number } | { type: 'skip'; now: number }

function reducer(drill: Drill) {
  return (state: State, action: Action): State => {
    const input = action.type === 'key' ? applyKey(state.input, action.key) : state.input
    const skipped = action.type === 'skip'
    if (!skipped && !isCorrect(state.problem, input)) return { ...state, input }
    const { prompt, answer, kind } = state.problem
    const attempt: Attempt = { prompt, answer, kind, ms: Math.round(action.now - state.shownAt), ...(skipped && { skipped }) }
    return { problem: nextProblem(drill, state.problem), input: '', shownAt: action.now, attempts: [...state.attempts, attempt] }
  }
}

const KEYS: Record<string, string> = { Backspace: 'back', Delete: 'back', Escape: 'clear', ',': '.' }

function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function Run({ drill, seconds, onFinish, onQuit }: {
  drill: Drill
  seconds: number
  onFinish: (startedAt: number, attempts: Attempt[]) => void
  onQuit: () => void
}) {
  const [state, dispatch] = useReducer(reducer(drill), undefined, () => ({
    problem: nextProblem(drill), input: '', shownAt: performance.now(), attempts: [],
  }))
  const [timing] = useState(() => ({ startedAt: Date.now(), endsAt: performance.now() + seconds * 1000 }))
  const [remaining, setRemaining] = useState(seconds * 1000)
  const latest = useRef(state)
  latest.current = state
  const finished = useRef(false)
  const finish = useRef(onFinish)
  finish.current = onFinish

  useEffect(() => {
    const tick = () => {
      const left = timing.endsAt - performance.now()
      setRemaining(left)
      if (left <= 0 && !finished.current) {
        finished.current = true
        finish.current(timing.startedAt, latest.current.attempts)
      }
    }
    const timer = setInterval(tick, 200)
    // Catch up straight away when returning from the background.
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [timing])

  const press = (key: string) => {
    if (!finished.current) dispatch({ type: 'key', key, now: performance.now() })
  }

  // Hardware keyboards (iPad Magic Keyboard, desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const key = KEYS[e.key] ?? e.key
      if (/^[\d.]$/.test(key) || key === 'back' || key === 'clear') {
        e.preventDefault()
        if (key !== '.' || drill.decimal) press(key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const solved = state.attempts.filter((a) => !a.skipped).length
  const elapsed = 1 - Math.max(0, remaining) / (seconds * 1000)

  return (
    <div className="mm-run">
      <div className="mm-run-head">
        <div className="mm-run-stat">
          <span className="mm-run-value">{solved}</span>
          <span className="mm-run-label">solved</span>
        </div>
        <button type="button" className="mm-text-button" onClick={onQuit}>Quit</button>
        <div className="mm-run-stat mm-run-stat-end" data-low={remaining <= 10_000 || undefined}>
          <span className="mm-run-value" role="timer">{clock(remaining)}</span>
          <span className="mm-run-label">left</span>
        </div>
      </div>
      <div className="mm-clock-rule" aria-hidden>
        <div className="mm-clock-fill" style={{ width: `${elapsed * 100}%` }} />
      </div>

      <div className="mm-run-body">
        <div className="mm-stage" aria-live="polite">
          <p key={state.attempts.length} className="mm-problem">{state.problem.prompt}</p>
          <p className="mm-hint">{state.problem.hint ?? '\u00a0'}</p>
          <p className="mm-answer" data-empty={!state.input || undefined} aria-label="Your answer">
            {state.input || '\u00a0'}
          </p>
          <button type="button" className="mm-text-button" onClick={() => !finished.current && dispatch({ type: 'skip', now: performance.now() })}>
            Skip
          </button>
        </div>
        <Keypad decimal={drill.decimal} onKey={press} />
      </div>
    </div>
  )
}
