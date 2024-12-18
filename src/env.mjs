// @ts-check

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	client: {
		NEXT_PUBLIC_URL: z.string().url().optional(),
		NEXT_PUBLIC_NEWSLETTER_ENDPOINT: z.string().optional(),
		NEXT_PUBLIC_LANGUAGE: z.string().optional().default("en-US"),
	},
	runtimeEnv: {
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
		NEXT_PUBLIC_NEWSLETTER_ENDPOINT: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT,
		NEXT_PUBLIC_LANGUAGE: process.env.NEXT_PUBLIC_LANGUAGE,
	},
});

const publicUrl = process.env.NEXT_PUBLIC_URL;

if (!publicUrl) {
	throw new Error("Missing NEXT_PUBLIC_URL");
}

// force type inference to string
const _publicUrl = publicUrl;
export { _publicUrl as publicUrl };
