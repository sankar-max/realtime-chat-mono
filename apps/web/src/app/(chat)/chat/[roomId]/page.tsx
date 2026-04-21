import type { Metadata } from 'next'
import { RoomPageClient } from './RoomPageClient'

interface Props {
  params: Promise<{ roomId: string }>
}

/**
 * Dynamic metadata for the chat room.
 * This runs on the server to set the initial title/meta.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roomId } = await params

  // Note: To show the actual room name here, we would need to fetch it from the API.
  // Since auth is currently client-side only (localStorage), we'll use the ID for now.
  return {
    title: `Chat | ${roomId === 'new' ? 'New Message' : 'Private'}`,
    description: `Realtime conversation in room ${roomId}`,
  }
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params

  return <RoomPageClient roomId={roomId} />
}
