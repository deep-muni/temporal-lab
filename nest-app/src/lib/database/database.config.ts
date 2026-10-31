import { z } from 'zod';

const DEFAULT_POOL_MAX = 10;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;
const DEFAULT_STATEMENT_TIMEOUT_MS = 10_000;
const DEFAULT_APPLICATION_NAME = 'temporal-lab-api';

const databaseEnvSchema = z.object({
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: 'DATABASE_URL must be a postgresql:// connection string',
  }),
  DATABASE_POOL_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_POOL_MAX),
  DATABASE_CONNECTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_CONNECTION_TIMEOUT_MS),
  DATABASE_STATEMENT_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_STATEMENT_TIMEOUT_MS),
  DATABASE_APPLICATION_NAME: z
    .string()
    .min(1)
    .default(DEFAULT_APPLICATION_NAME),
});

type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export class DatabaseConfig {
  readonly url: string;
  readonly poolMax: number;
  readonly connectionTimeoutMs: number;
  readonly statementTimeoutMs: number;
  readonly applicationName: string;

  private constructor(env: DatabaseEnv) {
    this.url = env.DATABASE_URL;
    this.poolMax = env.DATABASE_POOL_MAX;
    this.connectionTimeoutMs = env.DATABASE_CONNECTION_TIMEOUT_MS;
    this.statementTimeoutMs = env.DATABASE_STATEMENT_TIMEOUT_MS;
    this.applicationName = env.DATABASE_APPLICATION_NAME;
  }

  static fromEnv(env: NodeJS.ProcessEnv): DatabaseConfig {
    return new DatabaseConfig(parseDatabaseEnv(env));
  }
}

function parseDatabaseEnv(env: NodeJS.ProcessEnv): DatabaseEnv {
  const result = databaseEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid database configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
