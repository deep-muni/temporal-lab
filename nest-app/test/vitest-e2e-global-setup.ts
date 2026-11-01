import { dbSetup, dbStop } from './support/db-setup';

const globalSetup = async () => {
  const { DATABASE_URL } = await dbSetup();

  process.env = {
    ...process.env,
    DATABASE_URL,
    AZURE_STORAGE_CONNECTION_STRING: 'UseDevelopmentStorage=true',
    AZURE_STORAGE_CONTAINER_NAME: 'documents-e2e',
    OLLAMA_HOST: 'http://ollama.invalid',
    OLLAMA_EMBEDDING_MODEL: 'e2e-embedding-model',
    DOCUMENTS_CHUNK_SIZE: '120',
    DOCUMENTS_CHUNK_OVERLAP: '0',
    DOCUMENTS_CHUNK_MIN_SIZE: '40',
    EMBEDDING_RETRY_DELAY_MS: '0',
  };

  return dbStop;
};

export default globalSetup;
