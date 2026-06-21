import { getSupabase } from '../_lib/supabase.js'

export async function GET() {
  let supabase
  try {
    supabase = getSupabase()
  } catch {
    return Response.json({ status: 'error', message: 'Database not configured' }, { status: 500 })
  }

  const { count, error } = await supabase
    .from('sightings')
    .select('id', { count: 'exact', head: true })

  if (error) {
    const ref = process.env.SUPABASE_PROJECT_REF
    const token = process.env.SUPABASE_ACCESS_TOKEN
    if (ref && token) {
      try {
        await fetch(`https://api.supabase.com/v1/projects/${ref}/restore`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        return Response.json({ status: 'restoring' })
      } catch {
        return Response.json({ status: 'error', message: 'Failed to trigger restore' }, { status: 500 })
      }
    }
    return Response.json({ status: 'paused', message: 'Cannot restore without credentials' })
  }

  return Response.json({ status: 'ok', count })
}
