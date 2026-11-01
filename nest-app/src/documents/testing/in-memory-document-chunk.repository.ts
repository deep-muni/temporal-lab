import { randomUUID } from 'node:crypto';
import type {
  EmbeddedChunk,
  PendingChunk,
} from '@src/documents/domain/models/document-chunk';
import type { DocumentChunkRepositoryPort } from '@src/documents/domain/ports/document-chunk-repository.port';

interface StoredChunk {
  id: string;
  documentId: string;
  position: number;
  text: string;
  embedding: number[] | null;
}

export class InMemoryDocumentChunkRepository implements DocumentChunkRepositoryPort {
  private chunks: StoredChunk[] = [];

  replaceForDocument(documentId: string, texts: string[]): Promise<void> {
    const others = this.chunks.filter(
      (chunk) => chunk.documentId !== documentId,
    );
    const replacements = texts.map((text, position) => ({
      id: randomUUID(),
      documentId,
      position,
      text,
      embedding: null,
    }));
    this.chunks = [...others, ...replacements];
    return Promise.resolve();
  }

  findPendingEmbedding(
    documentId: string,
    limit: number,
  ): Promise<PendingChunk[]> {
    const pending = this.pendingOf(documentId)
      .slice(0, limit)
      .map(({ id, text }) => ({ id, text }));
    return Promise.resolve(pending);
  }

  countPendingEmbedding(documentId: string): Promise<number> {
    return Promise.resolve(this.pendingOf(documentId).length);
  }

  saveEmbeddings(embedded: EmbeddedChunk[]): Promise<void> {
    const embeddingById = new Map(
      embedded.map((chunk) => [chunk.id, chunk.embedding]),
    );
    this.chunks = this.chunks.map((chunk) => ({
      ...chunk,
      embedding: embeddingById.get(chunk.id) ?? chunk.embedding,
    }));
    return Promise.resolve();
  }

  of(documentId: string) {
    return this.chunksOf(documentId).map(({ position, text, embedding }) => ({
      position,
      text,
      embedding,
    }));
  }

  private chunksOf(documentId: string): StoredChunk[] {
    return this.chunks
      .filter((chunk) => chunk.documentId === documentId)
      .sort((a, b) => a.position - b.position);
  }

  private pendingOf(documentId: string): StoredChunk[] {
    return this.chunksOf(documentId).filter(
      (chunk) => chunk.embedding === null,
    );
  }
}
