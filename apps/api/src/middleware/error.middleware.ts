import { env } from '@chat/config'
import type { Context } from 'hono'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'

export async function errorHandler(error: Error, c: Context) {
  console.error(`[ERROR] ${c.req.method} ${c.req.url}:`, error)

  if (error instanceof AppError) {
    return c.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      error.statusCode,
    )
  }

  if (error instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      400,
    )
  }

  // Fallback for unhandled errors
  return c.json(
    {
      success: false,
      error: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      code: 'INTERNAL_SERVER_ERROR',
    },
    500,
  )
}
