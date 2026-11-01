import type { AxiosInstance } from 'axios';
import type { ZodType } from 'zod';

export async function httpGet<T>(
  client: AxiosInstance,
  url: string,
  schema: ZodType<T>,
): Promise<T> {
  const response = await client.get<unknown>(url);
  return schema.parse(response.data);
}
