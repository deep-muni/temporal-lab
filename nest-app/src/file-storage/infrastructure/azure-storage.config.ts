import { z } from 'zod';

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_TRIES = 3;

const azureStorageEnvSchema = z.object({
  AZURE_STORAGE_CONNECTION_STRING: z
    .string({ error: 'AZURE_STORAGE_CONNECTION_STRING is required' })
    .min(1, 'AZURE_STORAGE_CONNECTION_STRING is required'),
  AZURE_STORAGE_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_REQUEST_TIMEOUT_MS),
  AZURE_STORAGE_MAX_TRIES: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_MAX_TRIES),
});

type AzureStorageEnv = z.infer<typeof azureStorageEnvSchema>;

export class AzureStorageConfig {
  readonly connectionString: string;
  readonly requestTimeoutMs: number;
  readonly maxTries: number;

  private constructor(env: AzureStorageEnv) {
    this.connectionString = env.AZURE_STORAGE_CONNECTION_STRING;
    this.requestTimeoutMs = env.AZURE_STORAGE_REQUEST_TIMEOUT_MS;
    this.maxTries = env.AZURE_STORAGE_MAX_TRIES;
  }

  static fromEnv(env: NodeJS.ProcessEnv): AzureStorageConfig {
    return new AzureStorageConfig(parseAzureStorageEnv(env));
  }
}

function parseAzureStorageEnv(env: NodeJS.ProcessEnv): AzureStorageEnv {
  const result = azureStorageEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid Azure Storage configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
