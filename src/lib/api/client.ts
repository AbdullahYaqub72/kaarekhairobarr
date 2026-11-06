import { auth } from '@/lib/firebase/client'

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
}

/** Calls our API routes with the signed-in user's Firebase ID token. */
export async function api<T>(path: string, { method, body }: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const user = auth?.currentUser
  if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`

  let response: Response
  try {
    response = await fetch(path, {
      method: method ?? (body !== undefined ? 'POST' : 'GET'),
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })
  } catch {
    throw new ApiClientError(0, 'No connection. Check your internet and try again.')
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) {
    throw new ApiClientError(response.status, data.error ?? 'Something went wrong. Please try again.')
  }
  return data as T
}
