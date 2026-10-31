import { DocumentsConfig } from './documents.config';

describe('documents configuration', () => {
  it('keeps uploaded files in the documents container by default', () => {
    expect(DocumentsConfig.fromEnv({})).toEqual({ containerName: 'documents' });
  });

  it('lets each environment choose its own container', () => {
    const config = DocumentsConfig.fromEnv({
      AZURE_STORAGE_CONTAINER_NAME: 'documents-e2e-7f3a',
    });

    expect(config).toEqual({ containerName: 'documents-e2e-7f3a' });
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
