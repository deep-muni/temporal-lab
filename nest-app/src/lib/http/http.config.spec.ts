import { HttpConfig } from './http.config';

const LOCAL_SERVER = { HOST: '127.0.0.1', PORT: '3000' };

describe('HTTP configuration', () => {
  it('allows no browser origins unless they are listed', () => {
    expect(HttpConfig.fromEnv(LOCAL_SERVER)).toEqual({
      host: '127.0.0.1',
      port: 3000,
      corsOrigins: [],
    });
  });

  it('refuses to start without a host to listen on', () => {
    expect(() => HttpConfig.fromEnv({ PORT: '3000' })).toThrow(
      /HOST is required/,
    );
  });

  it('refuses to start without a port to listen on', () => {
    expect(() => HttpConfig.fromEnv({ HOST: '127.0.0.1' })).toThrow(/PORT/);
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
      HttpConfig.fromEnv({
        ...LOCAL_SERVER,
        CORS_ORIGINS: 'http://localhost:3100,localhost',
      }),
    ).toThrow('CORS_ORIGINS must be a comma-separated list of http(s) URLs');
  });

  it('refuses a port outside the valid range', () => {
    expect(() =>
      HttpConfig.fromEnv({ ...LOCAL_SERVER, PORT: '70000' }),
    ).toThrow(/PORT/);
  });
});
