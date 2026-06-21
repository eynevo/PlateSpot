import { getSupabase } from './_lib/supabase.js'
import { findState } from './_lib/regions.js'
import { randomUUID } from 'crypto'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const records = Array.isArray(body) ? body : [body]
  const supabase = getSupabase()
  const results = []

  for (const entry of records) {
    const match = findState(entry.state)
    if (!match) {
      results.push({ state: entry.state, error: 'Unknown state' })
      continue
    }

    const record = {
      id: randomUUID(),
      state: match.name,
      country: match.country,
      date: entry.date || new Date().toISOString().slice(0, 10),
      time: entry.time || null,
      lat: entry.lat || null,
      lng: entry.lng || null,
      address: entry.address || null,
      notes: entry.notes || null,
      source: entry.source || 'ui',
      created_at: entry.created_at || new Date().toISOString(),
    }

    const { error } = await supabase.from('sightings').insert(record)
    if (error) {
      results.push({ state: match.name, error: error.message })
    } else {
      results.push({ state: match.name, success: true })
    }
  }

  return Response.json({ results })
}
