// @ts-check

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		TRIEVE_DATASET_ID: z.string().optional(),
		TRIEVE_API_KEY: z.string().optional(),
	},
	client: {
		// Can be provided via env or parameters to Commerce Kit, thus optional
		NEXT_PUBLIC_URL: z.string().url().optional(),
		NEXT_PUBLIC_NEWSLETTER_ENDPOINT: z.string().optional(),
		NEXT_PUBLIC_LANGUAGE: z.string().optional().default("en-US"),
	},
	runtimeEnv: {
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
		NEXT_PUBLIC_NEWSLETTER_ENDPOINT: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT,
		NEXT_PUBLIC_LANGUAGE: process.env.NEXT_PUBLIC_LANGUAGE,

		TRIEVE_DATASET_ID: process.env.TRIEVE_DATASET_ID,
		TRIEVE_API_KEY: process.env.TRIEVE_API_KEY,
	},
});

const publicUrl = process.env.NEXT_PUBLIC_URL;

if (!publicUrl) {
	throw new Error("Missing NEXT_PUBLIC_URL");
}

// force type inference to string
const _publicUrl = publicUrl;
export { _publicUrl as publicUrl };
