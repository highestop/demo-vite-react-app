import './styles/global.less'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'

import { App } from './app/App'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)

  root.render(
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route element={<App />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  )
}
