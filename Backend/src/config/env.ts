import "dotenv/config"
import { z } from "zod"

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().optional(),
})

export type Env = z.infer<typeof schema>

export const env: Env = schema.parse(process.env)

export function corsOriginOption(): boolean | string | string[] {
  const raw = env.CORS_ORIGIN?.trim()
  if (!raw) return true
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean)
  if (parts.length === 1) return parts[0]!
  return parts
}
