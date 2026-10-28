import { ChevronLeft } from 'lucide-react'
import { goBack } from '../core/router'

export function TopBar({ title }: { title?: string }) {
  return (
    <header className="topbar">
      <button type="button" className="back" onClick={goBack}>
        <ChevronLeft aria-hidden size={26} strokeWidth={2.2} />
        <span>Hub</span>
      </button>
      {title && <span className="topbar-title">{title}</span>}
    </header>
  )
}
