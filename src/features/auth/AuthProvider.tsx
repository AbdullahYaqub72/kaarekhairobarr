'use client'

import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api/client'
import { errorMessage } from '@/lib/format'
import { auth } from '@/lib/firebase/client'
import type { MeResponse } from '@/types/models'
import { destinationFor, type Destination } from './routing'

interface AuthContextValue {
  /** 'loading' until we know who is signed in and have their profile. */
  status: 'loading' | 'ready'
  firebaseUser: User | null
  me: MeResponse | null
  /** Set when the profile could not be loaded (e.g. server not configured). */
  error: string | null
  destination: Destination
  isAdmin: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadMe = useCallback(async () => {
    try {
      setMe(await api<MeResponse>('/api/me'))
      setError(null)
    } catch (err) {
      setMe(null)
      setError(errorMessage(err))
    }
  }, [])

  useEffect(() => {
    if (!auth) {
      setStatus('ready')
      setError('Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* values to .env.local.')
      return
    }
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        setStatus('loading')
        await loadMe()
      } else {
        setMe(null)
        setError(null)
      }
      setStatus('ready')
    })
  }, [loadMe])

  const refresh = useCallback(async () => {
    if (auth?.currentUser) await loadMe()
  }, [loadMe])

  const signOut = useCallback(async () => {
    if (auth) await firebaseSignOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      firebaseUser,
      me,
      error,
      destination: destinationFor(Boolean(firebaseUser), me),
      isAdmin: me?.profile?.orgRole === 'admin' && me.profile.status === 'active',
      refresh,
      signOut,
    }),
    [status, firebaseUser, me, error, refresh, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
