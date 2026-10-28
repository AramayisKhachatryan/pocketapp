import { useLayoutEffect, useRef } from 'react'
import { depthOf, hrefFor } from './core/router'
import { findMiniApp } from './registry'
import { useRoute } from './ui/useRoute'
import { Home } from './screens/Home'
import { MiniAppScreen } from './screens/MiniAppScreen'
import { NotFound } from './screens/NotFound'

let homeScrollY = 0

export function App() {
  const route = useRoute()
  const key = hrefFor(route)
  const prevDepth = useRef(depthOf(route))
  const direction = depthOf(route) >= prevDepth.current ? 'push' : 'pop'

  useLayoutEffect(() => {
    prevDepth.current = depthOf(route)
    window.scrollTo(0, route.name === 'home' ? homeScrollY : 0)
    if (route.name !== 'home') return
    const save = () => { homeScrollY = window.scrollY }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [key])

  const app = route.name === 'app' ? findMiniApp(route.id) : undefined

  return (
    <div key={key} className="screen" data-enter={direction}>
      {route.name === 'home' ? <Home /> : app ? <MiniAppScreen app={app} /> : <NotFound />}
    </div>
  )
}
