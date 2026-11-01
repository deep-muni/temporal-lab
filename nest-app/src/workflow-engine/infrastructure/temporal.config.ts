import { z } from 'zod';

const HOST_AND_PORT = /^[^\s:/]+:\d+$/;

const temporalEnvSchema = z.object({
  TEMPORAL_ADDRESS: z
    .string({ error: 'TEMPORAL_ADDRESS is required' })
    .regex(HOST_AND_PORT, 'TEMPORAL_ADDRESS must be host:port'),
  TEMPORAL_NAMESPACE: z
    .string({ error: 'TEMPORAL_NAMESPACE is required' })
    .min(1, 'TEMPORAL_NAMESPACE is required'),
});

type TemporalEnv = z.infer<typeof temporalEnvSchema>;

export class TemporalConfig {
  readonly address: string;
  readonly namespace: string;

  private constructor(env: TemporalEnv) {
    this.address = env.TEMPORAL_ADDRESS;
    this.namespace = env.TEMPORAL_NAMESPACE;
  }

  static fromEnv(env: NodeJS.ProcessEnv): TemporalConfig {
    return new TemporalConfig(parseTemporalEnv(env));
  }
}

function parseTemporalEnv(env: NodeJS.ProcessEnv): TemporalEnv {
  const result = temporalEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid Temporal configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
