import { Gamepad2 } from 'lucide-react'
import './games.css'

// Lists the games, home-screen style. None are built yet, so it shows where they will go.
export default function Games() {
  return (
    <div className="gm">
      <header className="gm-header">
        <h1 className="gm-title">Games</h1>
        <p className="gm-sub">Nothing to play yet.</p>
      </header>
      <div className="grid">
        <div className="tile gm-slot">
          <span className="gm-slot-badge" aria-hidden>
            <Gamepad2 size={21} strokeWidth={1.9} />
          </span>
          <span className="tile-name">First game</span>
          <span className="tile-sub">Coming soon</span>
        </div>
      </div>
    </div>
  )
}
