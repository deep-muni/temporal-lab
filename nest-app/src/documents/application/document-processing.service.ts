import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentsDomainError } from '@src/documents/domain/errors/documents.errors';
import type { Document } from '@src/documents/domain/models/document';
import { toDocumentChunks } from '@src/documents/domain/models/document-chunk';
import { DocumentStatus } from '@src/documents/domain/models/document-status';
import { toDocumentText } from '@src/documents/domain/models/document-text';
import { contentTypeOf } from '@src/documents/domain/models/document-upload';
import {
  DOCUMENT_CHUNK_REPOSITORY_PORT,
  type DocumentChunkRepositoryPort,
} from '@src/documents/domain/ports/document-chunk-repository.port';
import {
  DOCUMENT_FILE_STORE_PORT,
  type DocumentFileStorePort,
} from '@src/documents/domain/ports/document-file-store.port';
import {
  DOCUMENT_REPOSITORY_PORT,
  type DocumentRepositoryPort,
} from '@src/documents/domain/ports/document-repository.port';
import {
  EMBEDDING_PORT,
  type EmbeddingPort,
} from '@src/documents/domain/ports/embedding.port';
import {
  TEXT_CHUNKER_PORT,
  type TextChunkerPort,
} from '@src/documents/domain/ports/text-chunker.port';
import {
  TRANSACTIONAL_CONTEXT_PORT,
  type TransactionalContextPort,
} from '@src/documents/domain/ports/transactional-context.port';

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY_PORT)
    private readonly documents: DocumentRepositoryPort,
    @Inject(DOCUMENT_FILE_STORE_PORT)
    private readonly files: DocumentFileStorePort,
    @Inject(TEXT_CHUNKER_PORT)
    private readonly chunker: TextChunkerPort,
    @Inject(EMBEDDING_PORT)
    private readonly embedder: EmbeddingPort,
    @Inject(DOCUMENT_CHUNK_REPOSITORY_PORT)
    private readonly chunks: DocumentChunkRepositoryPort,
    @Inject(TRANSACTIONAL_CONTEXT_PORT)
    private readonly transaction: TransactionalContextPort,
  ) {}

  async process(documentId: string): Promise<void> {
    const document = await this.documents.startProcessing(documentId);
    if (!document) {
      return;
    }
    try {
      await this.index(document);
    } catch (error) {
      await this.fail(document, error);
    }
  }

  private async index(document: Document): Promise<void> {
    const text = toDocumentText(await this.files.read(document.blobName));
    const texts = await this.chunker.split(text, contentTypeOf(document.name));
    const chunks = toDocumentChunks(texts, await this.embedder.embed(texts));
    await this.transaction.run(async () => {
      await this.chunks.replaceForDocument(document.id, chunks);
      await this.documents.finishProcessing(document.id, DocumentStatus.Ready);
    });
  }

  private async fail(document: Document, error: unknown): Promise<void> {
    this.logFailure(document, error);
    await this.documents.finishProcessing(document.id, DocumentStatus.Failed);
  }

  private logFailure(document: Document, error: unknown): void {
    const message = `Document ${document.id} failed`;
    if (error instanceof DocumentsDomainError) {
      this.logger.warn(`${message}: ${error.message}`);
      return;
    }
    this.logger.error(
      message,
      error instanceof Error ? error.stack : String(error),
    );
  }
}
