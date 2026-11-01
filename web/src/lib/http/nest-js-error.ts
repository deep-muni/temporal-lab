import { isAxiosError } from 'axios';
import { z } from 'zod';

export const nestJsErrorBodySchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});

export interface NestJsError {
  status: number;
  message: string;
}

export function nestJsErrorOf(error: unknown): NestJsError | undefined {
  if (!isAxiosError(error) || !error.response) {
    return undefined;
  }
  const body = nestJsErrorBodySchema.safeParse(error.response.data);
  if (!body.success) {
    return undefined;
  }
  return {
    status: error.response.status,
    message: [body.data.message].flat().join(' '),
  };
}
