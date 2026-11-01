import { z } from 'zod';

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

const ollamaEnvSchema = z.object({
  OLLAMA_HOST: z.url({
    protocol: /^https?$/,
    error: 'OLLAMA_HOST must be an http(s) URL',
  }),
  OLLAMA_EMBEDDING_MODEL: z
    .string({ error: 'OLLAMA_EMBEDDING_MODEL is required' })
    .min(1, 'OLLAMA_EMBEDDING_MODEL is required'),
  OLLAMA_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_REQUEST_TIMEOUT_MS),
});

type OllamaEnv = z.infer<typeof ollamaEnvSchema>;

export class OllamaConfig {
  readonly host: string;
  readonly embeddingModel: string;
  readonly requestTimeoutMs: number;

  private constructor(env: OllamaEnv) {
    this.host = env.OLLAMA_HOST;
    this.embeddingModel = env.OLLAMA_EMBEDDING_MODEL;
    this.requestTimeoutMs = env.OLLAMA_REQUEST_TIMEOUT_MS;
  }

  static fromEnv(env: NodeJS.ProcessEnv): OllamaConfig {
    return new OllamaConfig(parseOllamaEnv(env));
  }
}

function parseOllamaEnv(env: NodeJS.ProcessEnv): OllamaEnv {
  const result = ollamaEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid Ollama configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
