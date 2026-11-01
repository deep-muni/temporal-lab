import { describe, expect, it } from 'vitest';
import { readPublicEnv } from './public-env';

describe('public configuration', () => {
  it('reads the address of the API', () => {
    expect(
      readPublicEnv({ NEXT_PUBLIC_API_URL: 'http://localhost:3000' }),
    ).toEqual({ apiUrl: 'http://localhost:3000' });
  });

  it('refuses to start without the address of the API', () => {
    expect(() => readPublicEnv({})).toThrow(
      /NEXT_PUBLIC_API_URL must be an http\(s\) URL/,
    );
  });

  it('refuses an API address that is not http(s)', () => {
    expect(() =>
      readPublicEnv({ NEXT_PUBLIC_API_URL: 'localhost:3000' }),
    ).toThrow(/NEXT_PUBLIC_API_URL/);
  });
});
