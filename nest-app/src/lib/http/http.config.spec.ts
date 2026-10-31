import { HttpConfig } from './http.config';

describe('HTTP configuration', () => {
  it('listens on localhost:3000 and allows no browser origins by default', () => {
    expect(HttpConfig.fromEnv({})).toEqual({
      host: '127.0.0.1',
      port: 3000,
      corsOrigins: [],
    });
  });

  it('allows each listed browser origin', () => {
    const config = HttpConfig.fromEnv({
      HOST: '0.0.0.0',
      PORT: '8080',
      CORS_ORIGINS: 'http://localhost:3100, https://lab.example.com',
    });

    expect(config).toEqual({
      host: '0.0.0.0',
      port: 8080,
      corsOrigins: ['http://localhost:3100', 'https://lab.example.com'],
    });
  });

  it('refuses an origin that is not an http(s) URL', () => {
    expect(() =>
      HttpConfig.fromEnv({ CORS_ORIGINS: 'http://localhost:3100,localhost' }),
    ).toThrow('CORS_ORIGINS must be a comma-separated list of http(s) URLs');
  });

  it('refuses a port outside the valid range', () => {
    expect(() => HttpConfig.fromEnv({ PORT: '70000' })).toThrow(/PORT/);
  });
});
