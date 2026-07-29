import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import i18n from './i18n/i18n'

// Set Axios Base URL from Environment Variable
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
// Bypass ngrok browser warning
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

// Avoid stale PWA bundles while developing with Vite.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
)
