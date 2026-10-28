import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/stix-two-text/latin-400.css'
import '@fontsource/stix-two-text/latin-400-italic.css'
import './styles/global.css'
import { App } from './App'
import { requestPersistence } from './core/storage'
import { setupUpdates } from './updates'

requestPersistence()
setupUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
