import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DashboardDemo } from './demo/DashboardDemo'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DashboardDemo />
  </StrictMode>,
)
