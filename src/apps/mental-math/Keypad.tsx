import { Delete } from 'lucide-react'
import type { MouseEvent, PointerEvent, ReactNode } from 'react'

const ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']]

/**
 * Phone-style number pad. Keys fire on pointerdown so fast tapping feels instant;
 * click is handled only for non-pointer activation (VoiceOver, Switch Control).
 */
export function Keypad({ decimal, onKey }: { decimal: boolean; onKey: (key: string) => void }) {
  const key = (value: string, label: ReactNode = value, name = value) => (
    <button
      key={value}
      type="button"
      className="mm-key"
      aria-label={name}
      tabIndex={-1}
      onPointerDown={(e: PointerEvent) => {
        e.preventDefault()
        onKey(value)
      }}
      onClick={(e: MouseEvent) => {
        if (e.detail === 0) onKey(value)
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="mm-keypad">
      {ROWS.flat().map((d) => key(d))}
      {decimal ? key('.', '.', 'Decimal point') : <span />}
      {key('0')}
      {key('back', <Delete aria-hidden size={26} strokeWidth={1.8} />, 'Delete')}
    </div>
  )
}
