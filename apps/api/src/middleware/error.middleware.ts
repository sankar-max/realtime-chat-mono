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
    const formattedErrors = error.issues.reduce(
      (acc, issue) => {
        const path = issue.path.join('.')
        if (!acc[path]) acc[path] = issue.message
        return acc
      },
      {} as Record<string, string>,
    )

    return c.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: formattedErrors,
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
