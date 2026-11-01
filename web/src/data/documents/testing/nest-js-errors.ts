import { AxiosError, AxiosHeaders } from 'axios';

const REASON_BY_STATUS: Record<number, string> = {
  400: 'Bad Request',
  413: 'Payload Too Large',
  500: 'Internal Server Error',
};

export function nestJsError(status: number, message: string): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    {
      status,
      statusText: REASON_BY_STATUS[status] ?? '',
      headers: {},
      config,
      data: { statusCode: status, message, error: REASON_BY_STATUS[status] },
    },
  );
}
