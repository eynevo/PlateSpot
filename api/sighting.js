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

  const { state } = body
  if (!state) {
    return Response.json({ error: 'Missing "state" field' }, { status: 400 })
  }

  const match = findState(state)
  if (!match) {
    return Response.json({ error: `Unknown state: ${state}` }, { status: 400 })
  }

  let supabase
  try {
    supabase = getSupabase()
  } catch {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { error: pingError } = await supabase
    .from('sightings')
    .select('id', { count: 'exact', head: true })

  if (pingError) {
    const ref = process.env.SUPABASE_PROJECT_REF
    const token = process.env.SUPABASE_ACCESS_TOKEN
    if (ref && token) {
      fetch(`https://api.supabase.com/v1/projects/${ref}/restore`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {})
    }
    return Response.json({ error: 'Database is restoring, try again in a minute' }, { status: 503 })
  }

  const now = new Date()
  const record = {
    id: randomUUID(),
    state: match.name,
    country: match.country,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    lat: null,
    lng: null,
    address: null,
    notes: null,
    source: 'shortcut',
    created_at: now.toISOString(),
  }

  const { error } = await supabase.from('sightings').insert(record)
  if (error) {
    return Response.json({ error: 'Failed to save sighting' }, { status: 500 })
  }

  return Response.json({
    success: true,
    message: `Spotted ${match.name}!`,
  })
}
