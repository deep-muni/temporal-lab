import type { DocumentChunk } from '@src/documents/domain/models/document-chunk';

export const DOCUMENT_CHUNK_REPOSITORY_PORT = Symbol(
  'DOCUMENT_CHUNK_REPOSITORY_PORT',
);

export interface DocumentChunkRepositoryPort {
  replaceForDocument(
    documentId: string,
    chunks: DocumentChunk[],
  ): Promise<void>;
}
