import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError, type ZodType, type ZodTypeDef } from 'zod'
import { AdminConfigError } from '@/lib/firebase/admin'

/** Throw this from a route to return a clean error message to the user. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

type RouteContext<P> = { params: P }

/** Wraps a route handler with consistent error responses. */
export function handle<P = Record<string, string>>(
  fn: (req: Request, ctx: RouteContext<P>) => Promise<Response>
) {
  return async (req: Request, ctx: RouteContext<P>): Promise<Response> => {
    try {
      return await fn(req, ctx)
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status })
      }
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message ?? 'Please check the form and try again.'
        return NextResponse.json({ error: message }, { status: 400 })
      }
      if (error instanceof AdminConfigError) {
        console.error(error.message)
        return NextResponse.json({ error: error.message }, { status: 503 })
      }
      console.error(error)
      return NextResponse.json(
        { error: 'Something went wrong on our side. Please try again.' },
        { status: 500 }
      )
    }
  }
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export async function parseBody<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw new ApiError(400, 'Invalid request.')
  }
  return schema.parse(body)
}

export function nowIso() {
  return new Date().toISOString()
}
