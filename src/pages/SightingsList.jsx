import { useState, useMemo } from 'react'
import { useSightings } from '../context/SightingsContext'
import { REGIONS, getRegionCounts } from '../data/regions'
import ProgressBar from '../components/ProgressBar'
import Toast from '../components/Toast'

export default function SightingsList() {
  const { sightings, remove, update, stats, getStreak, exportCSV } = useSightings()
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [editingId, setEditingId] = useState(null)
  const [editNotes, setEditNotes] = useState('')
  const [expandedState, setExpandedState] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const s = stats()
  const streak = getStreak()
  const regionCounts = getRegionCounts()

  const countByCountry = useMemo(() => {
    const counts = { US: new Set(), CA: new Set(), MX: new Set() }
    for (const sg of sightings) {
      if (counts[sg.country]) counts[sg.country].add(sg.state)
    }
    return {
      US: counts.US.size,
      CA: counts.CA.size,
      MX: counts.MX.size,
    }
  }, [sightings])

  const filtered = useMemo(() => {
    let list = [...sightings]

    if (filterCountry !== 'ALL') {
      list = list.filter(s => s.country === filterCountry)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.state.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      )
    }

    switch (sortBy) {
      case 'oldest':
        list.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        break
      case 'alpha':
        list.sort((a, b) => a.state.localeCompare(b.state))
        break
      case 'newest':
      default:
        list.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
    }

    return list
  }, [sightings, search, filterCountry, sortBy])

  const grouped = useMemo(() => {
    if (!expandedState) return null
    return sightings.filter(s => `${s.country}:${s.state}` === expandedState)
  }, [sightings, expandedState])

  const handleEdit = (sighting) => {
    setEditingId(sighting.id)
    setEditNotes(sighting.notes || '')
  }

  const saveEdit = async (id) => {
    await update(id, { notes: editNotes.trim() || null })
    setEditingId(null)
    setToast('Updated!')
  }

  const handleDelete = async (id) => {
    await remove(id)
    setConfirmDelete(null)
    setToast('Sighting removed')
  }

  const notSpotted = useMemo(() => {
    return REGIONS.map(r => ({
      ...r,
      missing: r.items.filter(item => !s.uniqueStates.has(`${r.code}:${item}`)),
    })).filter(r => r.missing.length > 0)
  }, [s.uniqueStates])

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Unique Spotted" value={s.uniqueCount} />
        <StatCard label="Total Sightings" value={s.totalSightings} />
        <StatCard label="Current Streak" value={`${streak.current}d`} />
        <StatCard label="Best Streak" value={`${streak.best}d`} />
      </div>

      {s.mostSpotted && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Most Spotted" value={s.mostSpotted} small />
          <StatCard label="Least Spotted" value={s.leastSpotted} small />
        </div>
      )}

      {/* Progress Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4 space-y-3">
        <h3 className="font-semibold text-sm mb-2">Collection Progress</h3>
        <ProgressBar label="United States" flag="🇺🇸" current={countByCountry.US} total={regionCounts.US} />
        <ProgressBar label="Canada" flag="🇨🇦" current={countByCountry.CA} total={regionCounts.CA} />
        <ProgressBar label="Mexico" flag="🇲🇽" current={countByCountry.MX} total={regionCounts.MX} />
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <ProgressBar
            label="Overall"
            flag="🌎"
            current={s.uniqueCount}
            total={regionCounts.total}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterCountry}
          onChange={e => setFilterCountry(e.target.value)}
          className="px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none"
        >
          <option value="ALL">All</option>
          <option value="US">🇺🇸 US</option>
          <option value="CA">🇨🇦 CA</option>
          <option value="MX">🇲🇽 MX</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        {['newest', 'oldest', 'alpha'].map(opt => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === opt
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {opt === 'newest' ? 'Newest' : opt === 'oldest' ? 'Oldest' : 'A-Z'}
          </button>
        ))}
      </div>

      {/* Sightings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          <p className="text-sm">No sightings yet. Start spotting!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sg => (
            <div
              key={sg.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{sg.state}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {sg.country}
                    </span>
                    {s.byState[`${sg.country}:${sg.state}`] > 1 && (
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                        x{s.byState[`${sg.country}:${sg.state}`]}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {sg.date} at {sg.time}
                  </div>
                  {sg.address && (
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{sg.address}</div>
                  )}
                  {editingId === sg.id ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 rounded focus:outline-none"
                        placeholder="Notes..."
                        autoFocus
                      />
                      <button onClick={() => saveEdit(sg.id)} className="text-xs text-primary-600 font-medium">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">Cancel</button>
                    </div>
                  ) : sg.notes ? (
                    <div className="text-xs text-gray-500 mt-1 italic">"{sg.notes}"</div>
                  ) : null}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleEdit(sg)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                    </svg>
                  </button>
                  {confirmDelete === sg.id ? (
                    <button
                      onClick={() => handleDelete(sg.id)}
                      className="p-1.5 rounded-lg bg-red-500 text-white text-xs font-medium px-2"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(sg.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {sg.photo && (
                <img src={sg.photo} alt="Plate" className="w-full h-32 object-cover rounded-lg mt-2" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Not Yet Spotted */}
      {notSpotted.length > 0 && sightings.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-sm mb-3 text-gray-500 dark:text-gray-400">Not Yet Spotted</h3>
          {notSpotted.map(r => (
            <div key={r.code} className="mb-3">
              <div className="text-xs font-medium text-gray-400 mb-1">{r.flag} {r.label} ({r.missing.length} remaining)</div>
              <div className="flex flex-wrap gap-1.5">
                {r.missing.map(name => (
                  <span key={name} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export */}
      {sightings.length > 0 && (
        <button
          onClick={exportCSV}
          className="w-full mt-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Export as CSV
        </button>
      )}
    </div>
  )
}

function StatCard({ label, value, small }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
      <div className={`font-bold ${small ? 'text-sm' : 'text-2xl'} text-primary-600 dark:text-primary-400`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}
