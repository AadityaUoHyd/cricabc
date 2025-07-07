import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App  from './App.tsx'
import { UserProvider } from './context/UserContext.tsx'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
)
