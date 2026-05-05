import { InvalidCursorError } from '../errors'

export interface MessageCursor {
  id: string
  createdAt: Date
}

export function encodeCursor(cursor: { id: string; createdAt: string }): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64')
}

export function decodeCursor(cursorString: string): MessageCursor {
  try {
    const parsed = JSON.parse(Buffer.from(cursorString, 'base64').toString('utf-8'))

    if (!parsed.id || !parsed.createdAt) {
      throw new InvalidCursorError('Invalid cursor format')
    }

    const date = new Date(parsed.createdAt)
    if (isNaN(date.getTime())) {
      throw new InvalidCursorError('Invalid cursor date')
    }

    return {
      id: parsed.id,
      createdAt: date,
    }
  } catch (error) {
    throw new InvalidCursorError('Failed to parse cursor')
  }
}
