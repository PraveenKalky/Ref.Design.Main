import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Clear body to remove unnecessary content and ensure only the Navbar (from App) is shown
document.body.innerHTML = '<div id="root"></div>';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
