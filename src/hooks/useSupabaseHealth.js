import { useState, useEffect, useRef, useCallback } from 'react'

export function useSupabaseHealth(onHealthy) {
  const [status, setStatus] = useState('checking')
  const intervalRef = useRef(null)
  const restoredRef = useRef(false)

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/supabase/health')
      const data = await res.json()

      if (data.status === 'healthy') {
        setStatus('healthy')
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        onHealthy?.()
        return
      }

      if (data.status === 'paused' && !restoredRef.current) {
        setStatus('restoring')
        restoredRef.current = true
        await fetch('/api/supabase/health', { method: 'POST' })
        intervalRef.current = setInterval(async () => {
          try {
            const r = await fetch('/api/supabase/health')
            const d = await r.json()
            if (d.status === 'healthy') {
              setStatus('healthy')
              clearInterval(intervalRef.current)
              intervalRef.current = null
              onHealthy?.()
            }
          } catch {}
        }, 10000)
        return
      }

      if (data.status !== 'healthy') {
        setStatus(s => s === 'restoring' ? s : data.status)
      }
    } catch {
      setStatus('error')
    }
  }, [onHealthy])

  useEffect(() => {
    checkHealth()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [checkHealth])

  return status
}
