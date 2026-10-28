import { greetingFor } from '../core/time'
import { miniApps } from '../registry'
import { Tile } from '../ui/Tile'
import { YearRule } from '../ui/YearRule'

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

export function Home() {
  const now = new Date()
  return (
    <main className="home">
      <header className="home-header">
        <h1 className="greeting">{greetingFor(now)}</h1>
        <p className="date">{dateFormat.format(now)}</p>
        <YearRule date={now} />
      </header>
      <nav className="grid" aria-label="Apps">
        {miniApps.map((app) => <Tile key={app.id} app={app} />)}
      </nav>
    </main>
  )
}
