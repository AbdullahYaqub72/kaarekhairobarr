'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api/client'
import { errorMessage } from '@/lib/format'

/** Loads `path` from our API, with loading / error state and a reload(). */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const requestId = useRef(0)

  const reload = useCallback(async () => {
    if (!path) return
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await api<T>(path)
      if (id === requestId.current) setData(result)
    } catch (err) {
      if (id === requestId.current) setError(errorMessage(err))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [path])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, error, loading, reload }
}
