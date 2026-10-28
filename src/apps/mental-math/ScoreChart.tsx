import { useState, type PointerEvent } from 'react'
import type { Session } from './sessions'

const MAX_BARS = 30
const MIN_SLOTS = 12
const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

/**
 * Score per run, oldest to newest, from a zero baseline. Scrub across the chart
 * (or tap a bar) to read a run; it starts on the latest one.
 */
export function ScoreChart({ history }: { history: Session[] }) {
  const runs = history.slice(-MAX_BARS)
  const slots = Math.max(runs.length, MIN_SLOTS)
  const max = Math.max(...runs.map((s) => s.score), 1)
  const [picked, setPicked] = useState<number>()
  const index = Math.min(picked ?? runs.length - 1, runs.length - 1)
  const run = runs[index]

  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse') return
    const box = e.currentTarget.getBoundingClientRect()
    const i = Math.floor(((e.clientX - box.left) / box.width) * slots)
    setPicked(Math.max(0, Math.min(runs.length - 1, i)))
  }

  return (
    <figure className="mm-chart">
      <figcaption className="mm-chart-readout">
        <span className="mm-chart-score">{run.score}</span>
        <span className="mm-chart-date">{dateFormat.format(run.startedAt)}</span>
      </figcaption>
      <div
        className="mm-chart-plot"
        style={{ gridTemplateColumns: `repeat(${slots}, minmax(0, 1fr))` }}
        onPointerDown={scrub}
        onPointerMove={scrub}
        role="img"
        aria-label={`Scores of the last ${runs.length} runs, from ${runs[0].score} to ${runs[runs.length - 1].score}, best ${max}`}
      >
        {runs.map((s, i) => (
          <span
            key={s.id}
            className="mm-chart-bar"
            data-picked={i === index || undefined}
            style={{ height: `${Math.max((s.score / max) * 100, 2)}%` }}
          />
        ))}
      </div>
    </figure>
  )
}
