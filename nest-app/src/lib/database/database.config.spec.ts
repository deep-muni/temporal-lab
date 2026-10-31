import { DatabaseConfig } from './database.config';

const LAB_DATABASE_URL =
  'postgresql://temporal:s3cret-pass@localhost:15432/lab?schema=public';

describe('database configuration', () => {
  it('connects to a Postgres database with safe defaults for pool size and timeouts', () => {
    const config = DatabaseConfig.fromEnv({ DATABASE_URL: LAB_DATABASE_URL });

    expect(config).toEqual({
      url: LAB_DATABASE_URL,
      poolMax: 10,
      connectionTimeoutMs: 5_000,
      statementTimeoutMs: 10_000,
      applicationName: 'temporal-lab-api',
    });
  });

  it('lets each environment tune the pool, timeouts and application name', () => {
    const config = DatabaseConfig.fromEnv({
      DATABASE_URL: LAB_DATABASE_URL,
      DATABASE_POOL_MAX: '25',
      DATABASE_CONNECTION_TIMEOUT_MS: '2000',
      DATABASE_STATEMENT_TIMEOUT_MS: '30000',
      DATABASE_APPLICATION_NAME: 'temporal-lab-worker',
    });

    expect(config).toEqual({
      url: LAB_DATABASE_URL,
      poolMax: 25,
      connectionTimeoutMs: 2_000,
      statementTimeoutMs: 30_000,
      applicationName: 'temporal-lab-worker',
    });
  });

  it('refuses to start without a database URL', () => {
    expect(() => DatabaseConfig.fromEnv({})).toThrow(/DATABASE_URL/);
  });

  it('refuses a database URL that is not Postgres', () => {
    expect(() =>
      DatabaseConfig.fromEnv({ DATABASE_URL: 'mysql://root@localhost/lab' }),
    ).toThrow('DATABASE_URL must be a postgresql:// connection string');
  });

  it('refuses a pool size that is not a positive number', () => {
    expect(() =>
      DatabaseConfig.fromEnv({
        DATABASE_URL: LAB_DATABASE_URL,
        DATABASE_POOL_MAX: '0',
      }),
    ).toThrow(/DATABASE_POOL_MAX/);
  });

  it('never reveals the database password in a configuration error', () => {
    const readConfigWithBadTimeout = () =>
      DatabaseConfig.fromEnv({
        DATABASE_URL: LAB_DATABASE_URL,
        DATABASE_STATEMENT_TIMEOUT_MS: 'soon',
      });

    expect(readConfigWithBadTimeout).toThrow(/DATABASE_STATEMENT_TIMEOUT_MS/);
    expect(readConfigWithBadTimeout).not.toThrow(/s3cret-pass/);
  });
});
