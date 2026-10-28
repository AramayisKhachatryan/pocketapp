import { TopBar } from '../ui/TopBar'

export function NotFound() {
  return (
    <>
      <TopBar />
      <main className="placeholder">
        <h1 className="placeholder-name">Nothing here</h1>
        <p className="placeholder-sub">This link doesn't match any app. Go back to see them all.</p>
      </main>
    </>
  )
}
