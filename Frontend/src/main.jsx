import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AutenticacionProvider } from './contexto/AutenticacionContexto.jsx'
import { ToastProvider } from './componentes/Toast.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AutenticacionProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AutenticacionProvider>
    </BrowserRouter>
  </StrictMode>,
)
