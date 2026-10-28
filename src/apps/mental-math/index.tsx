import { useEffect, useState } from 'react'
import { findDrill, type Drill, type DrillId } from './drills'
import { bestScore, historyFor, loadPrefs, savePrefs, sessions, type Attempt, type Session } from './sessions'
import { Setup } from './Setup'
import { Run } from './Run'
import { Result } from './Result'
import './mental-math.css'

type View =
  | { name: 'setup' }
  | { name: 'run'; drill: Drill; seconds: number; key: number }
  | { name: 'result'; session: Session; previousBest?: number }

export default function MentalMath() {
  const [all, setAll] = useState<Session[]>()
  const [prefs, setPrefs] = useState<{ drill: DrillId; seconds: number }>()
  const [view, setView] = useState<View>({ name: 'setup' })

  useEffect(() => {
    Promise.all([sessions.list(), loadPrefs()]).then(([list, p]) => {
      setAll(list)
      setPrefs(p)
    })
  }, [])

  if (!all || !prefs) return null

  const choose = (drill: DrillId, seconds: number) => {
    setPrefs({ drill, seconds })
    savePrefs(drill, seconds)
  }

  const start = (drill: DrillId, seconds: number) => {
    choose(drill, seconds)
    setView({ name: 'run', drill: findDrill(drill), seconds, key: Date.now() })
  }

  const finish = async (drill: Drill, seconds: number, startedAt: number, attempts: Attempt[]) => {
    const previousBest = bestScore(historyFor(all, drill.id, seconds))
    const score = attempts.filter((a) => !a.skipped).length
    const session = await sessions.put({ drill: drill.id, seconds, score, startedAt, attempts })
    setAll((list) => [...(list ?? []), session])
    setView({ name: 'result', session, previousBest })
  }

  switch (view.name) {
    case 'setup':
      return <Setup sessions={all} initial={prefs} onStart={start} onChange={choose} />
    case 'run':
      return (
        <Run
          key={view.key}
          drill={view.drill}
          seconds={view.seconds}
          onFinish={(startedAt, attempts) => finish(view.drill, view.seconds, startedAt, attempts)}
          onQuit={() => setView({ name: 'setup' })}
        />
      )
    case 'result':
      return (
        <Result
          session={view.session}
          previousBest={view.previousBest}
          onAgain={() => start(view.session.drill, view.session.seconds)}
          onDone={() => setView({ name: 'setup' })}
        />
      )
  }
}
