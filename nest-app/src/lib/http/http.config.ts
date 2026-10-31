import { z } from 'zod';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;

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
  HOST: z.string().min(1).default(DEFAULT_HOST),
  PORT: z.coerce.number().int().min(1).max(65_535).default(DEFAULT_PORT),
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
