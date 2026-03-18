import fs from 'node:fs'
import path from 'node:path'
import * as schema from '@chat/schema'
import { createId } from '@chat/utils'
import { faker } from '@faker-js/faker'
import { db } from './client'

async function seed() {
  console.log('🌱 Starting database seeding...')

  // 1. Load users from user.json
  const userJsonPath = path.resolve(process.cwd(), '../../user.json')
  let existingUsers: any[] = []
  try {
    const data = fs.readFileSync(userJsonPath, 'utf8')
    existingUsers = JSON.parse(data)
  } catch (error) {
    console.warn('⚠️ Could not load user.json, proceeding with generated users only.')
  }

  console.log(`👥 Inserting ${existingUsers.length} users from user.json...`)
  for (const user of existingUsers) {
    await db
      .insert(schema.users)
      .values({
        id: user.id || createId(),
        email: user.email,
        displayName: user.display_name,
        passwordHash: user.password_hash,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        isVerified: user.is_verified ?? false,
        lastSeenAt: user.last_seen_at ? new Date(user.last_seen_at) : null,
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
      })
      .onConflictDoUpdate({
        target: schema.users.id,
        set: { email: user.email },
      })
  }

  // 2. Generate additional users
  const ADDITIONAL_USERS_COUNT = 100
  console.log(`👥 Generating ${ADDITIONAL_USERS_COUNT} additional users...`)
  const newUsers = []
  for (let i = 0; i < ADDITIONAL_USERS_COUNT; i++) {
    newUsers.push({
      id: createId(),
      email: faker.internet.email().toLowerCase(),
      displayName: faker.person.fullName(),
      passwordHash: '$2b$10$rYwUzKe6E9LA41TnMvI3b.zAlSShXmlUCSe2LVnADKN0V4eEZjcfO', // 'password'
      avatarUrl: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      isVerified: true,
      lastSeenAt: faker.date.recent(),
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    })
  }

  // Insert in chunks
  const chunkSize = 50
  for (let i = 0; i < newUsers.length; i += chunkSize) {
    await db.insert(schema.users).values(newUsers.slice(i, i + chunkSize))
  }

  const allUserIds = [...existingUsers.map((u) => u.id), ...newUsers.map((u) => u.id)]

  // 3. Create Rooms
  console.log('💬 Creating rooms...')
  const directRooms = []
  const usedKeys = new Set()

  // Direct Rooms
  for (let i = 0; i < 30; i++) {
    const u1 = allUserIds[Math.floor(Math.random() * allUserIds.length)]
    let u2 = allUserIds[Math.floor(Math.random() * allUserIds.length)]
    while (u1 === u2) u2 = allUserIds[Math.floor(Math.random() * allUserIds.length)]

    const dmKey = [u1, u2].sort().join(':')
    if (usedKeys.has(dmKey)) continue
    usedKeys.add(dmKey)

    directRooms.push({
      id: createId(),
      type: 'direct' as const,
      dmKey,
      createdAt: faker.date.past(),
    })
  }
  await db.insert(schema.rooms).values(directRooms)

  const groupRooms = []
  for (let i = 0; i < 15; i++) {
    groupRooms.push({
      id: createId(),
      name: faker.commerce.productName() + ' Chat',
      type: 'group' as const,
      createdAt: faker.date.past(),
    })
  }
  await db.insert(schema.rooms).values(groupRooms)

  const allRooms = [...directRooms, ...groupRooms]

  // 4. Room Members
  console.log('👥 Adding members to rooms...')
  const roomMembers: any[] = []

  // Members for direct rooms
  for (const room of directRooms) {
    const [u1, u2] = room.dmKey!.split(':')
    roomMembers.push(
      { id: createId(), roomId: room.id, userId: u1, role: 'member' as const },
      { id: createId(), roomId: room.id, userId: u2, role: 'member' as const },
    )
  }

  // Members for group rooms
  for (const room of groupRooms) {
    const memberCount = faker.number.int({ min: 5, max: 25 })
    const participants = faker.helpers.arrayElements(allUserIds, memberCount)
    participants.forEach((userId, index) => {
      roomMembers.push({
        id: createId(),
        roomId: room.id,
        userId,
        role: index === 0 ? ('admin' as const) : ('member' as const),
      })
    })
  }

  for (let i = 0; i < roomMembers.length; i += chunkSize) {
    await db.insert(schema.roomMembers).values(roomMembers.slice(i, i + chunkSize))
  }

  // 5. Messages
  console.log('💬 Generating messages...')
  const messages: any[] = []
  for (const room of allRooms) {
    const msgCount = faker.number.int({ min: 20, max: 100 })
    const possibleSenders = roomMembers.filter((rm) => rm.roomId === room.id).map((rm) => rm.userId)

    if (possibleSenders.length === 0) continue

    for (let i = 0; i < msgCount; i++) {
      messages.push({
        id: createId(),
        roomId: room.id,
        senderId: faker.helpers.arrayElement(possibleSenders),
        type: faker.helpers.arrayElement(['text', 'text', 'text', 'image', 'video'] as const),
        content: faker.lorem.sentence(),
        createdAt: faker.date.recent({ days: 30 }),
      })
    }
  }

  // Sort messages by date to make it realistic
  messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  for (let i = 0; i < messages.length; i += chunkSize) {
    await db.insert(schema.messages).values(messages.slice(i, i + chunkSize))
  }

  // 6. Attachments
  console.log('📎 Adding attachments...')
  const attachments = []
  const mediaMessages = messages.filter((m) => m.type !== 'text')
  for (const msg of mediaMessages) {
    attachments.push({
      id: createId(),
      messageId: msg.id,
      url: msg.type === 'image' ? faker.image.url() : 'https://www.w3schools.com/html/mov_bbb.mp4',
      type: msg.type as any,
      name: faker.system.fileName(),
      size: faker.number.int({ min: 1024, max: 1024 * 1024 * 10 }),
    })
  }
  if (attachments.length > 0) {
    for (let i = 0; i < attachments.length; i += chunkSize) {
      await db.insert(schema.attachments).values(attachments.slice(i, i + chunkSize))
    }
  }

  // 7. Message Receipts
  console.log('🧾 Generating message receipts...')
  const receipts: any[] = []
  // Only for half of the messages to save time
  for (const msg of messages.slice(0, Math.floor(messages.length / 2))) {
    const otherMembers = roomMembers.filter((rm) => rm.roomId === msg.roomId && rm.userId !== msg.senderId)
    for (const member of otherMembers) {
      receipts.push({
        messageId: msg.id,
        userId: member.userId,
        status: faker.helpers.arrayElement(['delivered', 'read'] as const),
        updatedAt: new Date(),
      })
    }
  }
  for (let i = 0; i < receipts.length; i += chunkSize) {
    await db
      .insert(schema.messageReceipts)
      .values(receipts.slice(i, i + chunkSize))
      .onConflictDoNothing()
  }

  // 8. Sessions & Device Tokens
  console.log('📱 Generating sessions and tokens...')
  const sessions = []
  const deviceTokens = []
  for (const userId of allUserIds) {
    sessions.push({
      id: createId(),
      userId,
      refreshToken: faker.string.alphanumeric(128),
      deviceName: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'iPhone App', 'Android App']),
      deviceIp: faker.internet.ipv4(),
      userAgent: faker.internet.userAgent(),
      expiresAt: faker.date.future(),
    })
    deviceTokens.push({
      id: createId(),
      userId,
      token: faker.string.alphanumeric(64),
      provider: faker.helpers.arrayElement(['expo', 'fcm', 'apns'] as const),
      deviceId: faker.string.uuid(),
    })
  }
  await db.insert(schema.sessions).values(sessions)
  await db.insert(schema.deviceTokens).values(deviceTokens)

  // 9. Calls
  console.log('📞 Generating calls...')
  const calls = []
  const callParticipants = []
  for (let i = 0; i < 20; i++) {
    const room = faker.helpers.arrayElement(groupRooms)
    const members = roomMembers.filter((rm) => rm.roomId === room.id).map((rm) => rm.userId)
    if (members.length < 2) continue

    const callId = createId()
    const callerId = faker.helpers.arrayElement(members)
    const startedAt = faker.date.recent({ days: 7 })

    calls.push({
      id: callId,
      roomId: room.id,
      callerId,
      type: faker.helpers.arrayElement(['voice', 'video'] as const),
      status: faker.helpers.arrayElement(['ended', 'missed'] as const),
      startedAt,
      endedAt: new Date(startedAt.getTime() + faker.number.int({ min: 30000, max: 1800000 })),
    })

    const participants = faker.helpers.arrayElements(members, faker.number.int({ min: 1, max: members.length }))
    for (const userId of participants) {
      callParticipants.push({
        id: createId(),
        callId,
        userId,
        status: faker.helpers.arrayElement(['joined', 'declined', 'missed'] as const),
        joinedAt: startedAt,
      })
    }
  }
  if (calls.length > 0) await db.insert(schema.calls).values(calls)
  if (callParticipants.length > 0) await db.insert(schema.callParticipants).values(callParticipants)

  console.log('✨ Seeding completed successfully!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
