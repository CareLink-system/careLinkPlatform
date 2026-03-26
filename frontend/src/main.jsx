import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            className: '!bg-white/85 !backdrop-blur-xl !border !border-slate-200 !shadow-xl',
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
