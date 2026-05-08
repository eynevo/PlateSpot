import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import AddSighting from './pages/AddSighting'
import SightingsList from './pages/SightingsList'
import MapView from './pages/MapView'
import { SightingsProvider } from './context/SightingsContext'

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('platespot-dark')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('platespot-dark', dark)
  }, [dark])

  const navClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
      isActive
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400'
    }`

  return (
    <HashRouter>
      <SightingsProvider>
        <div className="flex flex-col h-[100dvh]">
          <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-top">
            <h1 className="text-lg font-bold tracking-tight text-primary-700 dark:text-primary-400">
              PlateSpot
            </h1>
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<AddSighting />} />
              <Route path="/list" element={<SightingsList />} />
              <Route path="/map" element={<MapView />} />
            </Routes>
          </main>

          <nav className="flex justify-around bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
            <NavLink to="/" className={navClass} end>
              <PlusIcon />
              <span>Add</span>
            </NavLink>
            <NavLink to="/list" className={navClass}>
              <ListIcon />
              <span>List</span>
            </NavLink>
            <NavLink to="/map" className={navClass}>
              <MapIcon />
              <span>Map</span>
            </NavLink>
          </nav>
        </div>
      </SightingsProvider>
    </HashRouter>
  )
}

function PlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  )
}

export default App
