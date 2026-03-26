import { InvalidCursorError } from '../errors'

export type MessageCursor = {
  createdAt: string
  id: string
}

export function encodeCursor(cursor: MessageCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64')
}

export function decodeCursor(cursor: string): MessageCursor {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString())
  } catch {
    throw new InvalidCursorError('Invalid cursor')
  }
}
