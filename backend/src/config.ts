import 'dotenv/config';
import { z } from 'zod';

const originList = z.string().default('http://localhost:5173')
  .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean))
  .pipe(z.array(z.string().url()).min(1));

export const env = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  ML_SERVICE_URL: z.string().url().optional(),
  // Comma-separated allowed origins are supported for Vercel production + preview/local origins.
  FRONTEND_URL: originList,
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
}).parse(process.env);
