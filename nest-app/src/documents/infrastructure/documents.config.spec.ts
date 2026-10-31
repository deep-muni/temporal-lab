import { DocumentsConfig } from './documents.config';

describe('documents configuration', () => {
  it('keeps uploads of up to 1 MiB in the documents container by default', () => {
    expect(DocumentsConfig.fromEnv({})).toEqual({
      containerName: 'documents',
      maxUploadBytes: 1_048_576,
    });
  });

  it('lets each environment choose its own container and upload limit', () => {
    const config = DocumentsConfig.fromEnv({
      AZURE_STORAGE_CONTAINER_NAME: 'documents-e2e-7f3a',
      DOCUMENTS_MAX_UPLOAD_BYTES: '2048',
    });

    expect(config).toEqual({
      containerName: 'documents-e2e-7f3a',
      maxUploadBytes: 2048,
    });
  });

  it('refuses an upload limit that is not a positive number', () => {
    expect(() =>
      DocumentsConfig.fromEnv({ DOCUMENTS_MAX_UPLOAD_BYTES: '-1' }),
    ).toThrow(/DOCUMENTS_MAX_UPLOAD_BYTES/);
  });

  it('refuses a container name that Azure would reject', () => {
    expect(() =>
      DocumentsConfig.fromEnv({ AZURE_STORAGE_CONTAINER_NAME: 'My_Documents' }),
    ).toThrow(/AZURE_STORAGE_CONTAINER_NAME must be 3-63 lowercase letters/);
  });

  it('refuses a container name with consecutive hyphens', () => {
    expect(() =>
      DocumentsConfig.fromEnv({
        AZURE_STORAGE_CONTAINER_NAME: 'my--documents',
      }),
    ).toThrow(/AZURE_STORAGE_CONTAINER_NAME/);
  });
});
