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

// Après un déploiement, un onglet resté ouvert (ou une PWA relancée depuis l'écran
// d'accueil) peut encore référencer un chunk JS lazy-loadé (route/composant) dont le
// fichier hashé n'existe plus sur le serveur -> échec silencieux, UI cassée (ex: sidebar
// mobile qui n'apparaît pas) jusqu'à une actualisation manuelle. On détecte cet échec et
// on recharge automatiquement une seule fois.
window.addEventListener('vite:preloadError', () => {
  const alreadyReloaded = sessionStorage.getItem('edoteam-chunk-reload')
  if (alreadyReloaded) return
  sessionStorage.setItem('edoteam-chunk-reload', '1')
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
