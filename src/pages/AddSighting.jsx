import { useState, useEffect, useRef } from 'react'
import StateSelector from '../components/StateSelector'
import Toast from '../components/Toast'
import { useSightings } from '../context/SightingsContext'
import { useGeolocation } from '../hooks/useGeolocation'

export default function AddSighting() {
  const { add } = useSightings()
  const { location, loading: geoLoading, error: geoError, capture } = useGeolocation()
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [wantPhoto, setWantPhoto] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (selected && !showForm) {
      capture()
      setShowForm(true)
    }
  }, [selected, showForm, capture])

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!selected || submitting) return
    setSubmitting(true)

    const now = new Date()
    try {
      await add({
        state: selected.name,
        country: selected.country,
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
        lat: location?.lat || null,
        lng: location?.lng || null,
        address: location?.address || null,
        photo: photo || null,
        notes: notes.trim() || null,
      })

      setToast(`${selected.name} spotted!`)
      handleReset()
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelected(null)
    setShowForm(false)
    setWantPhoto(false)
    setPhoto(null)
    setNotes('')
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Spot a Plate</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the state or province you spotted
        </p>
      </div>

      <StateSelector value={selected} onChange={setSelected} />

      {showForm && selected && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          {/* Location - compact single line */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-sm truncate flex-1">
              {geoLoading ? (
                <span className="text-gray-400">Getting location...</span>
              ) : geoError ? (
                <span className="text-red-500">{geoError}</span>
              ) : location ? (
                <span className="text-gray-600 dark:text-gray-300">{location.address}</span>
              ) : (
                <span className="text-gray-400">Location unavailable</span>
              )}
            </span>
          </div>

          {/* Photo toggle + notes in one card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Photo</span>
              <button
                type="button"
                onClick={() => {
                  setWantPhoto(!wantPhoto)
                  if (wantPhoto) setPhoto(null)
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  wantPhoto ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  wantPhoto ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>

            {wantPhoto && (
              <div>
                {photo ? (
                  <div className="relative">
                    <img src={photo} alt="Plate" className="w-full h-28 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="absolute top-1 right-1 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-primary-400 transition-colors text-sm"
                  >
                    Tap to take photo
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhoto}
                  className="hidden"
                />
              </div>
            )}

            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : `Spot ${selected.name}`}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}
