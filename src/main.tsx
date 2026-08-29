import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { registerSW } from 'virtual:pwa-register'

// Enregistrement du service worker PWA.
// autoUpdate silencieux : la nouvelle version est appliquée au prochain chargement.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    // Vérifie les mises à jour toutes les heures.
    if (registration) {
      setInterval(() => registration.update().catch(() => undefined), 60 * 60 * 1000)
    }
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
