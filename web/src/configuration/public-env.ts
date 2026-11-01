import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url({
    protocol: /^https?$/,
    error: 'NEXT_PUBLIC_API_URL must be an http(s) URL',
  }),
});

export interface PublicEnvSource {
  NEXT_PUBLIC_API_URL?: string;
}

export interface PublicEnv {
  apiUrl: string;
}

export function readPublicEnv(
  env: PublicEnvSource = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
): PublicEnv {
  const result = publicEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid public configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return { apiUrl: result.data.NEXT_PUBLIC_API_URL };
}
