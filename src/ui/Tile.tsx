import type { CSSProperties } from 'react'
import { hrefFor } from '../core/router'
import type { MiniApp } from '../registry'
import { AppBadge } from './AppBadge'

export function Tile({ app }: { app: MiniApp }) {
  return (
    <a
      className="tile"
      href={hrefFor({ name: 'app', id: app.id })}
      data-status={app.status}
      style={{ '--accent': app.accent } as CSSProperties}
    >
      <AppBadge app={app} />
      <span className="tile-name">{app.name}</span>
      <span className="tile-sub">{app.subtitle}</span>
    </a>
  )
}
