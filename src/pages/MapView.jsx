import { useState, useMemo, useEffect } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps'
import { useSightings } from '../context/SightingsContext'
import { getRegionCounts } from '../data/regions'
import { STATE_NAME_MAP } from '../data/stateNameMap'
import ProgressBar from '../components/ProgressBar'

const US_TOPO = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
const CA_GEO = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/canada.geojson'
const MX_GEO = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/mexico.geojson'

const COLORS = {
  US: { spotted: '#dc2626', missing: '#fee2e2', missingDark: '#7f1d1d' },
  CA: { spotted: '#60a5fa', missing: '#dbeafe', missingDark: '#1e3a5f' },
  MX: { spotted: '#4ade80', missing: '#dcfce7', missingDark: '#14532d' },
}

function CountryMap({ geoUrl, country, projection, projectionConfig, width, height, isSpotted, getCount, onSelect, isDark }) {
  const colors = COLORS[country]

  return (
    <ComposableMap
      projection={projection}
      projectionConfig={projectionConfig}
      width={width}
      height={height}
      style={{ width: '100%', height: 'auto' }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map(geo => {
            const props = geo.properties
            const rawName = props.name || props.NAME || props.NAME_1 || ''
            const name = STATE_NAME_MAP[rawName] || rawName

            const spotted = isSpotted(name, country)
            const fill = spotted
              ? colors.spotted
              : isDark ? colors.missingDark : colors.missing

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={fill}
                stroke={isDark ? '#374151' : '#fff'}
                strokeWidth={0.5}
                onClick={() => onSelect(name, country)}
                style={{
                  default: { outline: 'none', cursor: 'pointer' },
                  hover: { outline: 'none', opacity: 0.8, cursor: 'pointer' },
                  pressed: { outline: 'none' },
                }}
              />
            )
          })
        }
      </Geographies>
    </ComposableMap>
  )
}

export default function MapView() {
  const { sightings, stats } = useSightings()
  const [viewCountry, setViewCountry] = useState('US')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  const s = stats()
  const regionCounts = getRegionCounts()

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const countByCountry = useMemo(() => {
    const counts = { US: new Set(), CA: new Set(), MX: new Set() }
    for (const sg of sightings) {
      if (counts[sg.country]) counts[sg.country].add(sg.state)
    }
    return { US: counts.US.size, CA: counts.CA.size, MX: counts.MX.size }
  }, [sightings])

  const isSpotted = (name, country) => s.uniqueStates.has(`${country}:${name}`)
  const getCount = (name, country) => s.byState[`${country}:${name}`] || 0

  const handleSelect = (name, country) => {
    setSelectedRegion({ name, country, count: getCount(name, country) })
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      <h2 className="text-xl font-bold mb-3">Collection Map</h2>

      <div className="flex gap-2 mb-4">
        {[
          { code: 'US', label: '🇺🇸 United States' },
          { code: 'CA', label: '🇨🇦 Canada' },
          { code: 'MX', label: '🇲🇽 Mexico' },
        ].map(opt => (
          <button
            key={opt.code}
            onClick={() => { setViewCountry(opt.code); setSelectedRegion(null) }}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              viewCountry === opt.code
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
        {viewCountry === 'US' && (
          <CountryMap
            geoUrl={US_TOPO}
            country="US"
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 900 }}
            width={800}
            height={500}
            isSpotted={isSpotted}
            getCount={getCount}
            onSelect={handleSelect}
            isDark={isDark}
          />
        )}
        {viewCountry === 'CA' && (
          <CountryMap
            geoUrl={CA_GEO}
            country="CA"
            projection="geoMercator"
            projectionConfig={{ scale: 350, center: [-96, 62] }}
            width={800}
            height={550}
            isSpotted={isSpotted}
            getCount={getCount}
            onSelect={handleSelect}
            isDark={isDark}
          />
        )}
        {viewCountry === 'MX' && (
          <CountryMap
            geoUrl={MX_GEO}
            country="MX"
            projection="geoMercator"
            projectionConfig={{ scale: 1200, center: [-102, 24] }}
            width={800}
            height={550}
            isSpotted={isSpotted}
            getCount={getCount}
            onSelect={handleSelect}
            isDark={isDark}
          />
        )}
      </div>

      {selectedRegion && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm">{selectedRegion.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {selectedRegion.count > 0
                  ? `Spotted ${selectedRegion.count}x`
                  : 'Not yet spotted'}
              </span>
            </div>
            <button onClick={() => setSelectedRegion(null)} className="text-gray-400 text-xs">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <ProgressBar label="United States" flag="🇺🇸" current={countByCountry.US} total={regionCounts.US} />
        <ProgressBar label="Canada" flag="🇨🇦" current={countByCountry.CA} total={regionCounts.CA} />
        <ProgressBar label="Mexico" flag="🇲🇽" current={countByCountry.MX} total={regionCounts.MX} />
      </div>
    </div>
  )
}
