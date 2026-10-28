import { lazy, Suspense, type ComponentType, type CSSProperties, type LazyExoticComponent } from 'react'
import type { MiniApp } from '../registry'
import { AppBadge } from '../ui/AppBadge'
import { TopBar } from '../ui/TopBar'

const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>()

function lazyFor(app: MiniApp & { load: NonNullable<MiniApp['load']> }) {
  let component = lazyCache.get(app.id)
  if (!component) lazyCache.set(app.id, (component = lazy(app.load)))
  return component
}

export function MiniAppScreen({ app }: { app: MiniApp }) {
  if (!app.load) {
    return (
      <>
        <TopBar />
        <main className="placeholder">
          <AppBadge app={app} size="lg" />
          <h1 className="placeholder-name">{app.name}</h1>
          <p className="placeholder-sub">{app.subtitle}</p>
          <p className="placeholder-status">Coming soon</p>
        </main>
      </>
    )
  }
  const Body = lazyFor({ ...app, load: app.load })
  return (
    <>
      <TopBar title={app.name} />
      <main className="miniapp" style={{ '--accent': app.accent } as CSSProperties}>
        <Suspense fallback={null}>
          <Body />
        </Suspense>
      </main>
    </>
  )
}
