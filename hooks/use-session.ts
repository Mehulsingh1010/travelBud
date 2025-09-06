"use client"

import { useState, useEffect } from "react"

interface User {
  userId: number
  email: string
  name: string
  role: string
}

interface UseSessionReturn {
  session: User | null
  loading: boolean
  error: string | null
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setSession(data.user)
        } else {
          setSession(null)
        }
      } catch (err) {
        console.error('Session check error:', err)
        setError('Failed to check session')
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return { session, loading, error }
}
