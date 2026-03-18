import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodSchema } from 'zod'

/**
 * Custom validation middleware that wraps `@hono/zod-validator`
 * and throws the error to be caught by global error handling.
 */
export const validate = <T extends ZodSchema, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw result.error
    }
  })
