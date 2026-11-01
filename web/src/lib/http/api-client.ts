import axios, { type AxiosInstance } from 'axios';

export const API_REQUEST_TIMEOUT_MS = 15_000;

export function createApiClient(baseURL: string): AxiosInstance {
  return axios.create({ baseURL, timeout: API_REQUEST_TIMEOUT_MS });
}
