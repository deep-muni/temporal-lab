import { z } from 'zod';

const DEFAULT_BATCH_SIZE = 16;
const DEFAULT_CONCURRENCY = 2;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1_000;

const embeddingEnvSchema = z.object({
  EMBEDDING_BATCH_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_BATCH_SIZE),
  EMBEDDING_CONCURRENCY: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_CONCURRENCY),
  EMBEDDING_MAX_RETRIES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(DEFAULT_MAX_RETRIES),
  EMBEDDING_RETRY_DELAY_MS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(DEFAULT_RETRY_DELAY_MS),
});

type EmbeddingEnv = z.infer<typeof embeddingEnvSchema>;

export class EmbeddingConfig {
  readonly batchSize: number;
  readonly concurrency: number;
  readonly maxRetries: number;
  readonly retryDelayMs: number;

  private constructor(env: EmbeddingEnv) {
    this.batchSize = env.EMBEDDING_BATCH_SIZE;
    this.concurrency = env.EMBEDDING_CONCURRENCY;
    this.maxRetries = env.EMBEDDING_MAX_RETRIES;
    this.retryDelayMs = env.EMBEDDING_RETRY_DELAY_MS;
  }

  static fromEnv(env: NodeJS.ProcessEnv): EmbeddingConfig {
    return new EmbeddingConfig(parseEmbeddingEnv(env));
  }
}

function parseEmbeddingEnv(env: NodeJS.ProcessEnv): EmbeddingEnv {
  const result = embeddingEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid embedding configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
