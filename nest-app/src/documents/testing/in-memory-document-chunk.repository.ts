import type { DocumentChunk } from '@src/documents/domain/models/document-chunk';
import type { DocumentChunkRepositoryPort } from '@src/documents/domain/ports/document-chunk-repository.port';

export class InMemoryDocumentChunkRepository implements DocumentChunkRepositoryPort {
  private readonly chunksByDocument = new Map<string, DocumentChunk[]>();

  replaceForDocument(
    documentId: string,
    chunks: DocumentChunk[],
  ): Promise<void> {
    this.chunksByDocument.set(documentId, chunks);
    return Promise.resolve();
  }

  of(documentId: string): DocumentChunk[] {
    return this.chunksByDocument.get(documentId) ?? [];
  }
}
