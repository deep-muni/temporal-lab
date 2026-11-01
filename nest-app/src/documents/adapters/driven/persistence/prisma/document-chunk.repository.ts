import { InjectTransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import type {
  EmbeddedChunk,
  PendingChunk,
} from '@src/documents/domain/models/document-chunk';
import type { DocumentChunkRepositoryPort } from '@src/documents/domain/ports/document-chunk-repository.port';
import type { PrismaTransactionHost } from '@src/lib/database/prisma-transaction-host';

@Injectable()
export class PrismaDocumentChunkRepository implements DocumentChunkRepositoryPort {
  constructor(
    @InjectTransactionHost()
    private readonly txHost: PrismaTransactionHost,
  ) {}

  async replaceForDocument(documentId: string, texts: string[]): Promise<void> {
    await this.txHost.tx.documentChunk.deleteMany({ where: { documentId } });
    await this.txHost.tx.documentChunk.createMany({
      data: texts.map((text, position) => ({ documentId, position, text })),
    });
  }

  findPendingEmbedding(
    documentId: string,
    limit: number,
  ): Promise<PendingChunk[]> {
    return this.txHost.tx.$queryRaw<PendingChunk[]>`
      SELECT "id", "text" FROM "document_chunks"
      WHERE "documentId" = ${documentId}::uuid AND "embedding" IS NULL
      ORDER BY "position"
      LIMIT ${limit}`;
  }

  async countPendingEmbedding(documentId: string): Promise<number> {
    const [{ pending }] = await this.txHost.tx.$queryRaw<[{ pending: number }]>`
      SELECT count(*)::int AS "pending" FROM "document_chunks"
      WHERE "documentId" = ${documentId}::uuid AND "embedding" IS NULL`;
    return pending;
  }

  async saveEmbeddings(chunks: EmbeddedChunk[]): Promise<void> {
    const ids = chunks.map((chunk) => chunk.id);
    const embeddings = chunks.map((chunk) => toVectorLiteral(chunk.embedding));
    await this.txHost.tx.$executeRaw`
      UPDATE "document_chunks" AS chunk
      SET "embedding" = embedded.embedding::vector
      FROM unnest(${ids}::uuid[], ${embeddings}::text[]) AS embedded(id, embedding)
      WHERE chunk."id" = embedded.id`;
  }
}

function toVectorLiteral(embedding: number[]): string {
  return JSON.stringify(embedding);
}
