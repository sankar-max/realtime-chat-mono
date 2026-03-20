import { env } from '@chat/config'
import type { Context } from 'hono'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'
import { sendError } from '../lib/response'

export async function errorHandler(error: Error, c: Context) {
  console.error(`[ERROR] ${c.req.method} ${c.req.url}:`, error)

  if (error instanceof AppError) {
    return sendError(c, error.message, error.code, error.statusCode)
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

    return sendError(c, 'Validation failed', 'VALIDATION_ERROR', 400, formattedErrors)
  }

  // Fallback for unhandled errors
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  return sendError(c, message, 'INTERNAL_SERVER_ERROR', 500)
}
