import { supabase } from './supabase'
import { getAllSightings, addSyncedSighting, markSynced } from '../data/db'

export async function sync() {
  if (!supabase) return { pulled: 0, pushed: 0 }

  let pulled = 0
  let pushed = 0

  const { data: remoteRecords, error: fetchError } = await supabase
    .from('sightings')
    .select('*')
  if (fetchError) throw fetchError

  const localRecords = await getAllSightings()
  const localIds = new Set(localRecords.map(r => r.id))
  const remoteIds = new Set(remoteRecords.map(r => r.id))

  for (const remote of remoteRecords) {
    if (!localIds.has(remote.id)) {
      await addSyncedSighting({
        id: remote.id,
        state: remote.state,
        country: remote.country,
        date: remote.date,
        time: remote.time,
        lat: remote.lat,
        lng: remote.lng,
        address: remote.address,
        notes: remote.notes,
        source: remote.source || 'ui',
        photo: null,
        createdAt: remote.created_at,
      })
      pulled++
    }
  }

  const unsynced = localRecords.filter(r => !r.synced)
  for (const local of unsynced) {
    if (remoteIds.has(local.id)) {
      await markSynced(local.id)
      continue
    }
    const { photo, synced, ...rest } = local
    const { error } = await supabase.from('sightings').upsert({
      ...rest,
      created_at: local.createdAt,
    })
    if (!error) {
      await markSynced(local.id)
      pushed++
    }
  }

  return { pulled, pushed }
}
