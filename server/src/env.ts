import { z } from "zod";

const environmentSchema = z.enum(["sandbox"]);

const envSchema = z.object({
  SQUARE_ACCESS_TOKEN: z.string().min(1, "SQUARE_ACCESS_TOKEN is required"),
  SQUARE_ENVIRONMENT: environmentSchema.default("sandbox"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | undefined;

export function getEnv(): AppEnv {
  cachedEnv ??= envSchema.parse(process.env);
  return cachedEnv;
}

export function resetEnvForTests(): void {
  cachedEnv = undefined;
}
