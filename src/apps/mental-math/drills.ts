// Problem generators and answer checking. Plain TS, no React or DOM.

export type DrillId = 'standard' | 'products' | 'squares' | 'decimals' | 'fractions'

export interface Problem {
  /** What's shown, e.g. "47 × 8". Uses proper − × ÷ glyphs. */
  prompt: string
  /** Canonical answer string, e.g. "376" or "0.375". */
  answer: string
  /** Short tag used for per-type breakdowns in the results. */
  kind: string
  /** Extra instruction under the prompt, e.g. "to 3 d.p." */
  hint?: string
}

export interface Drill {
  id: DrillId
  name: string
  description: string
  /** Shown in the picker so the drill is recognizable at a glance. */
  example: string
  /** Whether the keypad needs a decimal point. */
  decimal: boolean
  generate(): Problem
}

const int = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

/** Integer in [lo, hi] that is not a multiple of 10 (those are too easy). */
const nonRound = (lo: number, hi: number) => {
  let n: number
  do n = int(lo, hi)
  while (n % 10 === 0)
  return n
}

/** Exact decimal string with at most `dp` places and no trailing zeros. */
export function formatDecimal(value: number, dp: number): string {
  const s = value.toFixed(dp)
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

// Zetamac defaults: (2–100) + (2–100), subtraction as reversed addition,
// (2–12) × (2–100), division as reversed multiplication.
function standard(): Problem {
  const op = int(0, 3)
  if (op === 0 || op === 1) {
    const a = int(2, 100)
    const b = int(2, 100)
    return op === 0
      ? { prompt: `${a} + ${b}`, answer: String(a + b), kind: '+' }
      : { prompt: `${a + b} − ${a}`, answer: String(b), kind: '−' }
  }
  const a = int(2, 12)
  const b = int(2, 100)
  if (op === 2) {
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]
    return { prompt: `${x} × ${y}`, answer: String(a * b), kind: '×' }
  }
  return { prompt: `${a * b} ÷ ${a}`, answer: String(b), kind: '÷' }
}

function products(): Problem {
  if (Math.random() < 0.6) {
    const a = nonRound(11, 99)
    const b = nonRound(11, 99)
    return { prompt: `${a} × ${b}`, answer: String(a * b), kind: '2d × 2d' }
  }
  const a = nonRound(101, 999)
  const b = int(3, 9)
  return { prompt: `${a} × ${b}`, answer: String(a * b), kind: '3d × 1d' }
}

function squares(): Problem {
  const n = nonRound(11, 99)
  return { prompt: `${n}²`, answer: String(n * n), kind: 'n²' }
}

const PERCENTS = [5, 12.5, 15, 20, 25, 30, 35, 40, 45, 60, 75, 80] as const
const DIVISORS = [4, 8, 20, 25, 40] as const

// Everything is built from integers and scaled at the end, so answers are exact.
function decimals(): Problem {
  switch (int(0, 3)) {
    case 0: {
      const p = pick(PERCENTS)
      let b: number
      do b = int(4, 80) * 5
      while ((p * b) % 10 !== 0) // at most one decimal place
      return { prompt: `${p}% of ${b}`, answer: formatDecimal((p * b) / 100, 1), kind: '%' }
    }
    case 1: {
      const tenths = nonRound(2, 99)
      const n = int(3, 19)
      return { prompt: `${formatDecimal(tenths / 10, 1)} × ${n}`, answer: formatDecimal((tenths * n) / 10, 1), kind: '0.x × n' }
    }
    case 2: {
      const a = nonRound(2, 49)
      const b = nonRound(2, 49)
      return {
        prompt: `${formatDecimal(a / 10, 1)} × ${formatDecimal(b / 10, 1)}`,
        answer: formatDecimal((a * b) / 100, 2),
        kind: '0.x × 0.y',
      }
    }
    default: {
      const d = pick(DIVISORS)
      let n: number
      do n = int(d + 1, d * 9)
      while (n % d === 0)
      return { prompt: `${n} ÷ ${d}`, answer: formatDecimal(n / d, 4), kind: 'n ÷ d' }
    }
  }
}

const DENOMINATORS = [3, 4, 5, 6, 7, 8, 9, 11, 12, 16] as const

/** True if n/d has a finite decimal expansion of at most 4 places. */
const terminates = (n: number, d: number) => Number.isInteger((n * 10_000) / d)

function fractions(): Problem {
  const d = pick(DENOMINATORS)
  let n: number
  do n = int(1, d - 1)
  while (gcd(n, d) !== 1)
  return terminates(n, d)
    ? { prompt: `${n}/${d}`, answer: formatDecimal(n / d, 4), kind: `/${d}` }
    : { prompt: `${n}/${d}`, answer: formatDecimal(n / d, 3), kind: `/${d}`, hint: 'to 3 d.p.' }
}

export const drills: readonly Drill[] = [
  { id: 'standard', name: 'Standard', description: 'Zetamac defaults: + − × ÷', example: '67 + 48', decimal: false, generate: standard },
  { id: 'products', name: 'Products', description: '2-digit × 2-digit, 3-digit × 1-digit', example: '47 × 86', decimal: false, generate: products },
  { id: 'squares', name: 'Squares', description: 'Squares of 11 to 99', example: '73²', decimal: false, generate: squares },
  { id: 'decimals', name: 'Decimals', description: 'Percentages, decimal products, quotients', example: '15% of 240', decimal: true, generate: decimals },
  { id: 'fractions', name: 'Fractions', description: 'Fraction to decimal', example: '5/8', decimal: true, generate: fractions },
]

export function findDrill(id: string): Drill {
  return drills.find((d) => d.id === id) ?? drills[0]
}

/** Next problem, avoiding an immediate repeat. */
export function nextProblem(drill: Drill, previous?: Problem): Problem {
  for (let i = 0; i < 10; i++) {
    const p = drill.generate()
    if (p.prompt !== previous?.prompt) return p
  }
  return drill.generate()
}

/** Typed input as the canonical form answers use: ".5" counts as "0.5". */
export function normalizeInput(input: string): string {
  return input.startsWith('.') ? `0${input}` : input
}

export function isCorrect(problem: Problem, input: string): boolean {
  return normalizeInput(input) === problem.answer
}

/** Apply one keypad key to the current input. Returns the new input. */
export function applyKey(input: string, key: string, maxLength = 9): string {
  if (key === 'back') return input.slice(0, -1)
  if (key === 'clear') return ''
  if (input.length >= maxLength) return input
  if (key === '.') return input.includes('.') ? input : input + '.'
  if (/^\d$/.test(key)) return input === '0' ? key : input + key
  return input
}
