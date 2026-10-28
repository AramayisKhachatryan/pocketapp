import { useState } from 'react'
import { Check } from 'lucide-react'
import { drills, findDrill, type DrillId } from './drills'
import { DURATIONS, bestScore, formatDuration, formatSeconds, historyFor, summarize, type Session } from './sessions'
import { ScoreChart } from './ScoreChart'

const dayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

function when(ms: number): string {
  const date = new Date(ms)
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(ms).setHours(0, 0, 0, 0)) / 86_400_000)
  const day = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : dayFormat.format(date)
  return `${day}, ${timeFormat.format(date)}`
}

export function Setup({ sessions, initial, onStart, onChange }: {
  sessions: Session[]
  initial: { drill: DrillId; seconds: number }
  onStart: (drill: DrillId, seconds: number) => void
  onChange: (drill: DrillId, seconds: number) => void
}) {
  const [drillId, setDrillId] = useState(initial.drill)
  const [seconds, setSeconds] = useState(initial.seconds)
  const drill = findDrill(drillId)
  const history = historyFor(sessions, drill.id, seconds)
  const best = bestScore(history)

  const choose = (d: DrillId, s: number) => {
    setDrillId(d)
    setSeconds(s)
    onChange(d, s)
  }

  return (
    <div className="mm-setup">
      <section className="mm-setup-main">
        <div className="mm-specimen" aria-hidden>
          <p className="mm-specimen-problem">{drill.example}</p>
          <p className="mm-specimen-caption">
            {best === undefined ? 'No runs yet' : `Best ${best} in ${formatDuration(seconds)} · ${history.length} ${history.length === 1 ? 'run' : 'runs'}`}
          </p>
        </div>

        <h2 className="mm-heading" id="mm-drill">Drill</h2>
        <div className="mm-drills" role="radiogroup" aria-labelledby="mm-drill">
          {drills.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={d.id === drill.id}
              className="mm-drill"
              onClick={() => choose(d.id, seconds)}
            >
              <span className="mm-drill-text">
                <span className="mm-drill-name">{d.name}</span>
                <span className="mm-drill-desc">{d.description}</span>
              </span>
              <Check className="mm-drill-check" aria-hidden size={20} strokeWidth={2.4} />
            </button>
          ))}
        </div>

        <h2 className="mm-heading" id="mm-length">Length</h2>
        <div className="mm-segments" role="radiogroup" aria-labelledby="mm-length">
          {DURATIONS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === seconds}
              className="mm-segment"
              onClick={() => choose(drill.id, s)}
            >
              {formatDuration(s)}
            </button>
          ))}
        </div>

        <button type="button" className="mm-primary" onClick={() => onStart(drill.id, seconds)}>
          Start
        </button>
      </section>

      <section className="mm-setup-side">
        <h2 className="mm-heading">History · {drill.name}, {formatDuration(seconds)}</h2>
        {history.length === 0 ? (
          <p className="mm-empty">Finished runs show up here, with your score over time.</p>
        ) : (
          <>
            <ScoreChart key={`${drill.id}/${seconds}`} history={history} />
            <ol className="mm-recent">
              {history.slice(-5).reverse().map((s) => (
                <li key={s.id} className="mm-recent-row">
                  <span className="mm-recent-when">{when(s.startedAt)}</span>
                  <span className="mm-recent-pace">{formatSeconds(summarize(s).meanMs)} each</span>
                  <span className="mm-recent-score">{s.score}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  )
}
