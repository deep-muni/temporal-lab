import { AzureStorageConfig } from './azure-storage.config.js';

const AZURITE_CONNECTION_STRING =
  'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=a2V5;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;';

describe('Azure Storage configuration', () => {
  it('connects to blob storage with bounded retries and a per-request timeout by default', () => {
    const config = AzureStorageConfig.fromEnv({
      AZURE_STORAGE_CONNECTION_STRING: AZURITE_CONNECTION_STRING,
    });

    expect(config).toEqual({
      connectionString: AZURITE_CONNECTION_STRING,
      requestTimeoutMs: 10_000,
      maxTries: 3,
    });
  });

  it('lets each environment tune the timeout and the number of tries', () => {
    const config = AzureStorageConfig.fromEnv({
      AZURE_STORAGE_CONNECTION_STRING: AZURITE_CONNECTION_STRING,
      AZURE_STORAGE_REQUEST_TIMEOUT_MS: '30000',
      AZURE_STORAGE_MAX_TRIES: '5',
    });

    expect(config).toEqual({
      connectionString: AZURITE_CONNECTION_STRING,
      requestTimeoutMs: 30_000,
      maxTries: 5,
    });
  });

  it('refuses to start without a connection string', () => {
    expect(() => AzureStorageConfig.fromEnv({})).toThrow(
      'AZURE_STORAGE_CONNECTION_STRING is required',
    );
  });

  it('never reveals the account key in a configuration error', () => {
    const readConfigWithBadTries = () =>
      AzureStorageConfig.fromEnv({
        AZURE_STORAGE_CONNECTION_STRING: AZURITE_CONNECTION_STRING,
        AZURE_STORAGE_MAX_TRIES: 'many',
      });

    expect(readConfigWithBadTries).toThrow(/AZURE_STORAGE_MAX_TRIES/);
    expect(readConfigWithBadTries).not.toThrow(/AccountKey/);
  });
});
