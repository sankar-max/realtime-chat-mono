import { db } from "@chat/db";
import { sessions, users } from "@chat/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export const authRepository = {
	async createUser(data: {
		email: string;
		passwordHash: string;
		displayName: string;
	}) {
		const [user] = await db
			.insert(users)
			.values({
				id: randomUUID(),
				email: data.email,
				passwordHash: data.passwordHash,
				displayName: data.displayName,
			})
			.returning();

		return user;
	},

	async findUserByEmail(email: string) {
		const [user] = await db.select().from(users).where(eq(users.email, email));

		return user ?? null;
	},

	async createSession(data: {
		userId: string;
		refreshToken: string;
		deviceName?: string;
		deviceIp?: string;
		userAgent?: string;
		expiresAt: Date;
	}) {
		const [session] = await db
			.insert(sessions)
			.values({
				id: randomUUID(),
				userId: data.userId,
				refreshToken: data.refreshToken,
				deviceName: data.deviceName ?? null,
				deviceIp: data.deviceIp ?? null,
				userAgent: data.userAgent ?? null,
				expiresAt: data.expiresAt,
			})
			.returning();

		return session;
	},
};
