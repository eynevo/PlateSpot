import { getSupabase } from '../_lib/supabase.js'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('sightings')
      .select('id', { count: 'exact', head: true })
    if (error) {
      return Response.json({ status: 'paused' })
    }
    return Response.json({ status: 'healthy' })
  } catch {
    return Response.json({ status: 'error', message: 'Could not reach database' })
  }
}

export async function POST() {
  const ref = process.env.SUPABASE_PROJECT_REF
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!ref || !token) {
    return Response.json({ status: 'error', message: 'Missing restore credentials' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${ref}/restore`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    if (response.ok) {
      return Response.json({ status: 'restoring' })
    }
    const body = await response.text()
    return Response.json({ status: 'error', message: body }, { status: response.status })
  } catch (err) {
    return Response.json({ status: 'error', message: err.message }, { status: 500 })
  }
}
