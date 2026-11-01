import type { AxiosInstance } from 'axios';
import type { ZodType } from 'zod';

export async function httpPostForm<T>(
  client: AxiosInstance,
  url: string,
  form: FormData,
  schema: ZodType<T>,
  timeoutMs?: number,
): Promise<T> {
  const response = await client.post<unknown>(url, form, {
    timeout: timeoutMs,
  });
  return schema.parse(response.data);
}
