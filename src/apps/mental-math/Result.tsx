import { useEffect, useState } from 'react'
import { findDrill } from './drills'
import { formatDuration, formatSeconds, summarize, type Session } from './sessions'

/** Taps landing right as the run ends are meant for the keypad, not these buttons. */
const ARM_DELAY_MS = 700

export function Result({ session, previousBest, onAgain, onDone }: {
  session: Session
  previousBest?: number
  onAgain: () => void
  onDone: () => void
}) {
  const drill = findDrill(session.drill)
  const summary = summarize(session)
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setArmed(true), ARM_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const verdict =
    previousBest === undefined ? 'First run' :
    session.score > previousBest ? `New best, up from ${previousBest}` :
    session.score === previousBest ? 'Equals your best' :
    `Best ${previousBest}`
  const slowestKind = Math.max(...summary.byKind.map((k) => k.meanMs), 1)
  // Skipped problems are the ones most worth reviewing, so they lead the list.
  const review = [...session.attempts.filter((a) => a.skipped), ...summary.slowest]

  return (
    <div className="mm-result">
      <header className="mm-result-head">
        <p className="mm-result-score">{session.score}</p>
        <p className="mm-result-caption">solved · {drill.name}, {formatDuration(session.seconds)}</p>
        <p className="mm-verdict" data-best={(previousBest !== undefined && session.score > previousBest) || undefined}>
          {verdict}
        </p>
      </header>

      <dl className="mm-figures">
        <div>
          <dt>Per problem</dt>
          <dd>{summary.solved ? formatSeconds(summary.meanMs) : '–'}</dd>
        </div>
        <div>
          <dt>Skipped</dt>
          <dd>{summary.skipped}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd>{((session.score / session.seconds) * 60).toFixed(1)}/min</dd>
        </div>
      </dl>

      {summary.byKind.length > 0 && (
        <section>
          <h2 className="mm-heading">Time by type</h2>
          <ul className="mm-kinds">
            {summary.byKind.map((k) => (
              <li key={k.kind} className="mm-kind">
                <span className="mm-kind-name">{k.kind}</span>
                <span className="mm-kind-track" aria-hidden>
                  <span className="mm-kind-bar" style={{ width: `${(k.meanMs / slowestKind) * 100}%` }} />
                </span>
                <span className="mm-kind-value">{formatSeconds(k.meanMs)}</span>
                <span className="mm-kind-count">×{k.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {review.length > 0 && (
        <section>
          <h2 className="mm-heading">{summary.skipped ? 'Skipped and slowest' : 'Slowest'}</h2>
          <ul className="mm-slowest">
            {review.map((a, i) => (
              <li key={i} className="mm-slow">
                <span className="mm-slow-problem">{a.prompt} = {a.answer}</span>
                <span className="mm-slow-time" data-skipped={a.skipped || undefined}>
                  {a.skipped ? 'skipped' : formatSeconds(a.ms)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mm-actions" data-armed={armed || undefined}>
        <button type="button" className="mm-primary" disabled={!armed} onClick={onAgain}>Again</button>
        <button type="button" className="mm-secondary" disabled={!armed} onClick={onDone}>Done</button>
      </div>
    </div>
  )
}
