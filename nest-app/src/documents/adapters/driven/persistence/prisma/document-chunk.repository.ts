import { InjectTransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import type { DocumentChunk } from '@src/documents/domain/models/document-chunk';
import type { DocumentChunkRepositoryPort } from '@src/documents/domain/ports/document-chunk-repository.port';
import type { PrismaTransactionHost } from '@src/lib/database/prisma-transaction-host';

@Injectable()
export class PrismaDocumentChunkRepository implements DocumentChunkRepositoryPort {
  constructor(
    @InjectTransactionHost()
    private readonly txHost: PrismaTransactionHost,
  ) {}

  async replaceForDocument(
    documentId: string,
    chunks: DocumentChunk[],
  ): Promise<void> {
    await this.txHost.tx.documentChunk.deleteMany({ where: { documentId } });
    await this.insert(documentId, chunks);
  }

  private async insert(
    documentId: string,
    chunks: DocumentChunk[],
  ): Promise<void> {
    const positions = chunks.map((chunk) => chunk.position);
    const texts = chunks.map((chunk) => chunk.text);
    const embeddings = chunks.map((chunk) => toVectorLiteral(chunk.embedding));
    await this.txHost.tx.$executeRaw`
      INSERT INTO "document_chunks" ("id", "documentId", "position", "text", "embedding")
      SELECT gen_random_uuid(), ${documentId}::uuid, chunk.position, chunk.text, chunk.embedding::vector
      FROM unnest(${positions}::int[], ${texts}::text[], ${embeddings}::text[])
        AS chunk(position, text, embedding)`;
  }
}

function toVectorLiteral(embedding: number[]): string {
  return JSON.stringify(embedding);
}
