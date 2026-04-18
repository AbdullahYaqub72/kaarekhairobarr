import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const requiredFirebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
}

export const missingFirebaseEnvVars = Object.entries(requiredFirebaseEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const isFirebaseConfigured = missingFirebaseEnvVars.length === 0

export const firebaseProjectId = firebaseConfig.projectId ?? ''
export const firebaseApiKey = firebaseConfig.apiKey ?? ''

const firestoreRestBaseUrl =
  firebaseProjectId.length > 0
    ? `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents`
    : ''

const app = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

export const db = app ? getFirestore(app) : null

function toFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null) {
    return { nullValue: null }
  }

  if (typeof value === 'string') {
    return { stringValue: value }
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value }
  }

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value }
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((entry) => toFirestoreValue(entry)),
      },
    }
  }

  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: toFirestoreFields(value as Record<string, unknown>),
      },
    }
  }

  throw new Error('Unsupported Firestore value type.')
}

function toFirestoreFields(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value)])
  )
}

function getFriendlyFirebaseErrorMessage(status: string | undefined, fallbackMessage?: string) {
  if (status === 'PERMISSION_DENIED') {
    return 'Firestore rules are blocking reads for this collection. Open Firebase Console > Firestore Database > Rules and allow read access for the frontend-managed collections.'
  }

  if (status === 'NOT_FOUND') {
    return `Firestore database is not ready for project ${firebaseProjectId}. Open Firebase Console > Firestore Database and create the default database first.`
  }

  if (status === 'DEADLINE_EXCEEDED') {
    return 'Firebase took too long to respond. Check your internet connection and Firestore setup, then try again.'
  }

  return fallbackMessage || 'Firebase request failed.'
}

function assertFirebaseWriteReady() {
  if (!isFirebaseConfigured || !firestoreRestBaseUrl || !firebaseApiKey) {
    throw new Error(
      'Firebase is not configured yet. Add the public Firebase env vars to enable saves.'
    )
  }
}

async function performFirestoreRequest(
  input: string,
  init: RequestInit,
  timeoutMs = 10000
): Promise<Record<string, unknown> | undefined> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    })

    const responseText = await response.text()
    const json = responseText.length > 0 ? (JSON.parse(responseText) as {
      error?: {
        code?: number
        status?: string
        message?: string
      }
      name?: string
    }) : undefined

    if (!response.ok) {
      throw new Error(
        getFriendlyFirebaseErrorMessage(json?.error?.status, json?.error?.message)
      )
    }

    return json as Record<string, unknown> | undefined
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'Firebase save timed out. If Firestore is newly configured, check that the database and rules are active, then try again.'
      )
    }

    throw error instanceof Error
      ? error
      : new Error('Unable to save to Firebase right now.')
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function createFirestoreDocument(
  collectionName: string,
  data: Record<string, unknown>,
  options?: {
    documentId?: string
    timeoutMs?: number
  }
) {
  assertFirebaseWriteReady()
  const timeoutMs = options?.timeoutMs ?? 10000
  const url = new URL(`${firestoreRestBaseUrl}/${collectionName}`)

  if (options?.documentId) {
    url.searchParams.set('documentId', options.documentId)
  }

  url.searchParams.set('key', firebaseApiKey)

  return performFirestoreRequest(
    url.toString(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: toFirestoreFields(data),
      }),
    },
    timeoutMs
  )
}

export async function updateFirestoreDocument(
  collectionName: string,
  documentId: string,
  data: Record<string, unknown>,
  options?: {
    timeoutMs?: number
  }
) {
  assertFirebaseWriteReady()

  const url = new URL(`${firestoreRestBaseUrl}/${collectionName}/${documentId}`)
  url.searchParams.set('key', firebaseApiKey)
  Object.keys(data).forEach((fieldPath) => {
    url.searchParams.append('updateMask.fieldPaths', fieldPath)
  })

  return performFirestoreRequest(
    url.toString(),
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: toFirestoreFields(data),
      }),
    },
    options?.timeoutMs ?? 10000
  )
}

export async function deleteFirestoreDocument(
  collectionName: string,
  documentId: string,
  options?: {
    timeoutMs?: number
  }
) {
  assertFirebaseWriteReady()

  const url = new URL(`${firestoreRestBaseUrl}/${collectionName}/${documentId}`)
  url.searchParams.set('key', firebaseApiKey)

  return performFirestoreRequest(
    url.toString(),
    {
      method: 'DELETE',
    },
    options?.timeoutMs ?? 10000
  )
}

export function getFirebaseReadHint() {
  return 'Firestore writes are available, but collection reads will fail until your Firestore rules allow read access for the frontend-managed collections.'
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !isFirebaseConfigured) {
  console.warn(
    `Firebase is disabled. Missing env vars: ${missingFirebaseEnvVars.join(', ')}`
  )
}
