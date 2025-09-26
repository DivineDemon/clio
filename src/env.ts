import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		NEXTAUTH_SECRET: z.string().min(32),
		NEXTAUTH_URL: z.string().url(),
		GITHUB_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(1),
		GITHUB_APP_ID: z.string().min(1),
		GITHUB_PRIVATE_KEY: z.string().min(1),
		GITHUB_WEBHOOK_SECRET: z.string().min(1),
		EMAILJS_SERVICE_ID: z.string().min(1),
		EMAILJS_TEMPLATE_ID: z.string().min(1),
		EMAILJS_PUBLIC_KEY: z.string().min(1),
		EMAIL_FROM: z.string().email(),
		LLM_API_URL: z.string().url(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		SKIP_ENV_VALIDATION: z.boolean().default(false),
		DEBUG: z.string().optional(),
	},
	client: {},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
		GITHUB_APP_ID: process.env.GITHUB_APP_ID,
		GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY,
		GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
		EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
		EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
		EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
		EMAIL_FROM: process.env.EMAIL_FROM,
		LLM_API_URL: process.env.LLM_API_URL,
		NODE_ENV: process.env.NODE_ENV,
		SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION === "true",
		DEBUG: process.env.DEBUG,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
