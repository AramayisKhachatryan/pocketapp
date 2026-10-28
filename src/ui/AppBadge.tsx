import type { CSSProperties } from 'react'
import type { MiniApp } from '../registry'

/** Planned apps get a tinted badge; built apps are "inked in" with solid accent. */
export function AppBadge({ app, size = 'md' }: { app: MiniApp; size?: 'md' | 'lg' }) {
  const Icon = app.icon
  return (
    <span
      className="badge"
      data-size={size}
      data-status={app.status}
      style={{ '--accent': app.accent } as CSSProperties}
      aria-hidden
    >
      <Icon size={size === 'lg' ? 34 : 21} strokeWidth={1.9} />
    </span>
  )
}
