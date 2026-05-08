import { useState, useRef, useEffect } from 'react'
import { REGIONS } from '../data/regions'

export default function StateSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = REGIONS.map(region => ({
    ...region,
    items: region.items.filter(item =>
      item.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(region => region.items.length > 0)

  const handleSelect = (name, country) => {
    onChange({ name, country })
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
      >
        {value ? (
          <span className="font-medium">{value.name}</span>
        ) : (
          <span className="text-gray-400">Select a state or province...</span>
        )}
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none text-sm"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map(region => (
              <div key={region.code}>
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 sticky top-0">
                  {region.flag} {region.label}
                </div>
                {region.items.map(item => (
                  <button
                    key={`${region.code}-${item}`}
                    type="button"
                    onClick={() => handleSelect(item, region.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors ${
                      value?.name === item ? 'bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 font-medium' : ''
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
