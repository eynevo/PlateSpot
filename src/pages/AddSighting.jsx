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

  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toTimeString().slice(0, 5)

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

    try {
      await add({
        state: selected.name,
        country: selected.country,
        date,
        time,
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

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Spot a Plate</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the state or province you spotted
        </p>
      </div>

      <StateSelector value={selected} onChange={setSelected} />

      {showForm && selected && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Date & Time</div>
                <div className="font-medium">{date} at {time}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                {geoLoading ? (
                  <div className="text-sm text-gray-400">Getting location...</div>
                ) : geoError ? (
                  <div className="text-sm text-red-500">{geoError}</div>
                ) : location ? (
                  <div className="font-medium text-sm truncate">{location.address}</div>
                ) : (
                  <div className="text-sm text-gray-400">Location unavailable</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Add a photo?</span>
              <button
                type="button"
                onClick={() => {
                  setWantPhoto(!wantPhoto)
                  if (wantPhoto) setPhoto(null)
                }}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  wantPhoto ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  wantPhoto ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>

            {wantPhoto && (
              <div>
                {photo ? (
                  <div className="relative">
                    <img src={photo} alt="Plate" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-primary-400 transition-colors"
                  >
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    <span className="text-sm">Tap to take photo</span>
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
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Car color, highway, etc."
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>

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
              className="flex-[2] py-3 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
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
