import { DocumentsConfig } from './documents.config';

describe('documents configuration', () => {
  it('keeps uploads of up to 1 MiB in the documents container by default', () => {
    expect(DocumentsConfig.fromEnv({})).toMatchObject({
      containerName: 'documents',
      maxUploadBytes: 1_048_576,
    });
  });

  it('splits documents into 1500-character chunks overlapping by 200 by default', () => {
    expect(DocumentsConfig.fromEnv({})).toMatchObject({
      chunking: { size: 1_500, overlap: 200, minSize: 200 },
    });
  });

  it('refuses a chunk overlap as large as the chunk itself', () => {
    expect(() =>
      DocumentsConfig.fromEnv({
        DOCUMENTS_CHUNK_SIZE: '500',
        DOCUMENTS_CHUNK_OVERLAP: '500',
      }),
    ).toThrow(
      /DOCUMENTS_CHUNK_OVERLAP must be smaller than DOCUMENTS_CHUNK_SIZE/,
    );
  });

  it('lets each environment choose its own container and upload limit', () => {
    const config = DocumentsConfig.fromEnv({
      AZURE_STORAGE_CONTAINER_NAME: 'documents-e2e-7f3a',
      DOCUMENTS_MAX_UPLOAD_BYTES: '2048',
    });

    expect(config).toMatchObject({
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
