import { openDB } from 'idb'

const DB_NAME = 'platespot'
const DB_VERSION = 1
const STORE = 'sightings'

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('state', 'state')
        store.createIndex('country', 'country')
        store.createIndex('date', 'date')
      }
    },
  })
}

export async function addSighting(sighting) {
  const db = await getDB()
  const id = crypto.randomUUID()
  const record = {
    ...sighting,
    id,
    createdAt: new Date().toISOString(),
  }
  await db.put(STORE, record)
  return record
}

export async function getAllSightings() {
  const db = await getDB()
  return db.getAll(STORE)
}

export async function getSighting(id) {
  const db = await getDB()
  return db.get(STORE, id)
}

export async function updateSighting(id, updates) {
  const db = await getDB()
  const existing = await db.get(STORE, id)
  if (!existing) return null
  const updated = { ...existing, ...updates, id }
  await db.put(STORE, updated)
  return updated
}

export async function deleteSighting(id) {
  const db = await getDB()
  await db.delete(STORE, id)
}

export async function exportToCSV() {
  const sightings = await getAllSightings()
  if (sightings.length === 0) return null

  const headers = ['State', 'Country', 'Date', 'Time', 'Latitude', 'Longitude', 'Address', 'Notes', 'Created At']
  const rows = sightings
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(s => [
      s.state,
      s.country,
      s.date,
      s.time,
      s.lat || '',
      s.lng || '',
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      s.createdAt,
    ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `platespot-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
