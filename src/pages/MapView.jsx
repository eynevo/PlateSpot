import { useState, useMemo } from 'react'
import { useSightings } from '../context/SightingsContext'
import { REGIONS, getRegionCounts } from '../data/regions'
import ProgressBar from '../components/ProgressBar'
import { US_PATHS } from '../data/mapPaths/us'
import { CA_PATHS } from '../data/mapPaths/ca'
import { MX_PATHS } from '../data/mapPaths/mx'

export default function MapView() {
  const { sightings, stats } = useSightings()
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [viewCountry, setViewCountry] = useState('ALL')

  const s = stats()
  const regionCounts = getRegionCounts()

  const countByCountry = useMemo(() => {
    const counts = { US: new Set(), CA: new Set(), MX: new Set() }
    for (const sg of sightings) {
      if (counts[sg.country]) counts[sg.country].add(sg.state)
    }
    return { US: counts.US.size, CA: counts.CA.size, MX: counts.MX.size }
  }, [sightings])

  const isSpotted = (name, country) => s.uniqueStates.has(`${country}:${name}`)
  const getCount = (name, country) => s.byState[`${country}:${name}`] || 0

  const handleRegionClick = (name, country) => {
    const count = getCount(name, country)
    if (count > 0) {
      setSelectedRegion({ name, country, count })
    } else {
      setSelectedRegion({ name, country, count: 0 })
    }
  }

  const renderPaths = (paths, country, spottedFill, defaultFill) =>
    paths.map(({ name, d }) => (
      <path
        key={`${country}-${name}`}
        d={d}
        fill={isSpotted(name, country) ? spottedFill : defaultFill}
        stroke="#fff"
        strokeWidth="0.5"
        className="cursor-pointer transition-colors duration-200 hover:opacity-80"
        onClick={() => handleRegionClick(name, country)}
      >
        <title>{name}{isSpotted(name, country) ? ` (${getCount(name, country)}x)` : ''}</title>
      </path>
    ))

  const showUS = viewCountry === 'ALL' || viewCountry === 'US'
  const showCA = viewCountry === 'ALL' || viewCountry === 'CA'
  const showMX = viewCountry === 'ALL' || viewCountry === 'MX'

  const viewBox = viewCountry === 'US' ? '60 200 900 500'
    : viewCountry === 'CA' ? '50 0 950 350'
    : viewCountry === 'MX' ? '50 450 500 400'
    : '0 0 1000 800'

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      <h2 className="text-xl font-bold mb-3">Collection Map</h2>

      {/* Country Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { code: 'ALL', label: 'All' },
          { code: 'US', label: '🇺🇸 US' },
          { code: 'CA', label: '🇨🇦 CA' },
          { code: 'MX', label: '🇲🇽 MX' },
        ].map(opt => (
          <button
            key={opt.code}
            onClick={() => { setViewCountry(opt.code); setSelectedRegion(null) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewCountry === opt.code
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* SVG Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
        <svg viewBox={viewBox} className="w-full" style={{ minHeight: 250 }}>
          <rect x="0" y="0" width="1000" height="800" fill="transparent" />
          {showCA && renderPaths(CA_PATHS, 'CA', '#2563eb', '#dbeafe')}
          {showUS && renderPaths(US_PATHS, 'US', '#dc2626', '#fee2e2')}
          {showMX && renderPaths(MX_PATHS, 'MX', '#16a34a', '#dcfce7')}
        </svg>
      </div>

      {/* Selected Region Info */}
      {selectedRegion && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{selectedRegion.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {selectedRegion.count > 0
                  ? `Spotted ${selectedRegion.count} time${selectedRegion.count > 1 ? 's' : ''}`
                  : 'Not yet spotted'}
              </div>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-600" /> US Spotted
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> US Missing
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-600" /> CA Spotted
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> CA Missing
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-600" /> MX Spotted
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-200" /> MX Missing
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <ProgressBar label="United States" flag="🇺🇸" current={countByCountry.US} total={regionCounts.US} />
        <ProgressBar label="Canada" flag="🇨🇦" current={countByCountry.CA} total={regionCounts.CA} />
        <ProgressBar label="Mexico" flag="🇲🇽" current={countByCountry.MX} total={regionCounts.MX} />
      </div>
    </div>
  )
}
