import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as db from '../data/db'

const SightingsContext = createContext(null)

export function SightingsProvider({ children }) {
  const [sightings, setSightings] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await db.getAllSightings()
    setSightings(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const add = useCallback(async (sighting) => {
    const record = await db.addSighting(sighting)
    await refresh()
    return record
  }, [refresh])

  const remove = useCallback(async (id) => {
    await db.deleteSighting(id)
    await refresh()
  }, [refresh])

  const update = useCallback(async (id, updates) => {
    const record = await db.updateSighting(id, updates)
    await refresh()
    return record
  }, [refresh])

  const stats = useCallback(() => {
    const uniqueStates = new Set(sightings.map(s => `${s.country}:${s.state}`))
    const byState = {}
    for (const s of sightings) {
      const key = `${s.country}:${s.state}`
      byState[key] = (byState[key] || 0) + 1
    }
    const sorted = Object.entries(byState).sort((a, b) => b[1] - a[1])
    const mostSpotted = sorted[0] ? sorted[0][0].split(':')[1] : null
    const leastSpotted = sorted[sorted.length - 1] ? sorted[sorted.length - 1][0].split(':')[1] : null

    return {
      uniqueCount: uniqueStates.size,
      totalSightings: sightings.length,
      mostSpotted,
      leastSpotted,
      byState,
      uniqueStates,
    }
  }, [sightings])

  const getStreak = useCallback(() => {
    if (sightings.length === 0) return { current: 0, best: 0 }

    const dates = [...new Set(sightings.map(s => s.date))].sort().reverse()
    const today = new Date().toISOString().slice(0, 10)

    let current = 0
    let checkDate = today
    for (const date of dates) {
      if (date === checkDate) {
        current++
        const prev = new Date(checkDate)
        prev.setDate(prev.getDate() - 1)
        checkDate = prev.toISOString().slice(0, 10)
      } else if (date < checkDate) {
        break
      }
    }

    let best = 0
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      prev.setDate(prev.getDate() - 1)
      if (dates[i] === prev.toISOString().slice(0, 10)) {
        streak++
      } else {
        best = Math.max(best, streak)
        streak = 1
      }
    }
    best = Math.max(best, streak)

    return { current, best }
  }, [sightings])

  return (
    <SightingsContext.Provider value={{ sightings, loading, add, remove, update, stats, getStreak, exportCSV: db.exportToCSV }}>
      {children}
    </SightingsContext.Provider>
  )
}

export function useSightings() {
  const ctx = useContext(SightingsContext)
  if (!ctx) throw new Error('useSightings must be used within SightingsProvider')
  return ctx
}
