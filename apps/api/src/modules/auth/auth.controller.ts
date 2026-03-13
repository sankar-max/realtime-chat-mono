import type { Context } from "hono";

import { loginSchema, registerSchema } from "./auth.schema";
import { authService } from "./auth.service";

export const authController = {
	async register(c: Context) {
		try {
			const body = await c.req.json();

			const data = registerSchema.parse(body);

			const user = await authService.register(data);

			return c.json(
				{
					success: true,
					data: user,
				},
				201,
			);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				},
				400,
			);
		}
	},

	async login(c: Context) {
		try {
			const body = await c.req.json();

			const data = loginSchema.parse(body);

			const user = await authService.login(data);

			return c.json({
				success: true,
				data: user,
			});
		} catch (error) {
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				},
				400,
			);
		}
	},
};
