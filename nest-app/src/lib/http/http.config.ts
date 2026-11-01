import { z } from 'zod';

const originListSchema = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  )
  .pipe(
    z.array(
      z.url({
        protocol: /^https?$/,
        error: 'CORS_ORIGINS must be a comma-separated list of http(s) URLs',
      }),
    ),
  );

const httpEnvSchema = z.object({
  HOST: z.string({ error: 'HOST is required' }).min(1, 'HOST is required'),
  PORT: z.coerce
    .number({ error: 'PORT must be a number from 1 to 65535' })
    .int()
    .min(1)
    .max(65_535),
  CORS_ORIGINS: originListSchema,
});

type HttpEnv = z.infer<typeof httpEnvSchema>;

export class HttpConfig {
  readonly host: string;
  readonly port: number;
  readonly corsOrigins: string[];

  private constructor(env: HttpEnv) {
    this.host = env.HOST;
    this.port = env.PORT;
    this.corsOrigins = env.CORS_ORIGINS;
  }

  static fromEnv(env: NodeJS.ProcessEnv): HttpConfig {
    return new HttpConfig(parseHttpEnv(env));
  }
}

function parseHttpEnv(env: NodeJS.ProcessEnv): HttpEnv {
  const result = httpEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid HTTP configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
