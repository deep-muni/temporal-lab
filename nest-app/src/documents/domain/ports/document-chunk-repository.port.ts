import type {
  EmbeddedChunk,
  PendingChunk,
} from '@src/documents/domain/models/document-chunk';

export const DOCUMENT_CHUNK_REPOSITORY_PORT = Symbol(
  'DOCUMENT_CHUNK_REPOSITORY_PORT',
);

export interface DocumentChunkRepositoryPort {
  replaceForDocument(documentId: string, texts: string[]): Promise<void>;
  findPendingEmbedding(
    documentId: string,
    limit: number,
  ): Promise<PendingChunk[]>;
  countPendingEmbedding(documentId: string): Promise<number>;
  saveEmbeddings(chunks: EmbeddedChunk[]): Promise<void>;
}
