import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
  error?: string
  code?: string
  errors?: Record<string, string>
}

export const sendSuccess = <T>(c: Context, data?: T, message?: string, status: ContentfulStatusCode = 200) => {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    status,
  )
}

export const sendError = (
  c: Context,
  error: string,
  code: string = 'INTERNAL_SERVER_ERROR',
  status: ContentfulStatusCode = 500,
  errors?: Record<string, string>,
) => {
  return c.json(
    {
      success: false,
      error,
      code,
      errors,
    },
    status,
  )
}
