import { dayOfYear, daysInYear, monthStarts } from '../core/time'

/** A ruler for the year: month ticks, with the elapsed part inked in. */
export function YearRule({ date }: { date: Date }) {
  const year = date.getFullYear()
  const day = dayOfYear(date)
  const total = daysInYear(year)
  return (
    <div className="year">
      <div className="year-rule" role="img" aria-label={`Day ${day} of ${total}`}>
        <div className="year-fill" style={{ width: `${(day / total) * 100}%` }} />
        {monthStarts(year).map((f) => (
          <span key={f} className="year-tick" style={{ left: `${f * 100}%` }} />
        ))}
      </div>
      <span className="year-caption">Day {day} of {total}</span>
    </div>
  )
}
