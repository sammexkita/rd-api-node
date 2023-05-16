import "dotenv/config";

import { z } from "zod";

const evnSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
  CODE: z.string(),
  TOKEN_CRM: z.string(),
});

const _env = evnSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('⚠️ Invalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data;