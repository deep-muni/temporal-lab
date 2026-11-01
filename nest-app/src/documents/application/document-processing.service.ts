import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DocumentNotFoundError,
  DocumentNotFullyEmbeddedError,
  DocumentsDomainError,
} from '@src/documents/domain/errors/documents.errors';
import type { Document } from '@src/documents/domain/models/document';
import {
  toEmbeddedChunks,
  type PendingChunk,
} from '@src/documents/domain/models/document-chunk';
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
import { DocumentsConfig } from '@src/documents/infrastructure/documents.config';

export type EmbeddingProgressListener = (embeddedSoFar: number) => void;

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
    @Inject(DocumentsConfig)
    private readonly config: DocumentsConfig,
  ) {}

  async process(documentId: string): Promise<void> {
    if (!(await this.startProcessing(documentId))) {
      return;
    }
    try {
      await this.splitIntoChunks(documentId);
      await this.embedChunks(documentId);
      await this.markReady(documentId);
    } catch (error) {
      await this.markFailed(documentId, error);
    }
  }

  async startProcessing(documentId: string): Promise<boolean> {
    const document = await this.documents.startProcessing(documentId);
    return document !== undefined;
  }

  async splitIntoChunks(documentId: string): Promise<number> {
    const document = await this.findDocument(documentId);
    const text = toDocumentText(await this.files.read(document.blobName));
    const texts = await this.chunker.split(text, contentTypeOf(document.name));
    await this.transaction.run(() =>
      this.chunks.replaceForDocument(documentId, texts),
    );
    return texts.length;
  }

  async embedChunks(
    documentId: string,
    onBatchSaved: EmbeddingProgressListener = () => undefined,
  ): Promise<number> {
    let embeddedSoFar = 0;
    let batch = await this.nextPendingBatch(documentId);
    while (batch.length > 0) {
      await this.embedBatch(batch);
      embeddedSoFar += batch.length;
      onBatchSaved(embeddedSoFar);
      batch = await this.nextPendingBatch(documentId);
    }
    return embeddedSoFar;
  }

  async markReady(documentId: string): Promise<void> {
    const pending = await this.chunks.countPendingEmbedding(documentId);
    if (pending > 0) {
      throw new DocumentNotFullyEmbeddedError(documentId, pending);
    }
    await this.documents.finishProcessing(documentId, DocumentStatus.Ready);
  }

  async markFailed(documentId: string, error: unknown): Promise<void> {
    const failed = await this.transaction.run(async () => {
      const finished = await this.documents.finishProcessing(
        documentId,
        DocumentStatus.Failed,
      );
      if (finished) {
        await this.chunks.replaceForDocument(documentId, []);
      }
      return finished;
    });
    if (!failed) {
      this.logger.warn(
        `Document ${documentId} was deleted or finished while it was being read`,
      );
      return;
    }
    this.logFailure(documentId, error);
  }

  private async findDocument(documentId: string): Promise<Document> {
    const document = await this.documents.findById(documentId);
    if (!document) {
      throw new DocumentNotFoundError(documentId);
    }
    return document;
  }

  private nextPendingBatch(documentId: string): Promise<PendingChunk[]> {
    return this.chunks.findPendingEmbedding(
      documentId,
      this.config.embeddingBatchSize,
    );
  }

  private async embedBatch(batch: PendingChunk[]): Promise<void> {
    const embeddings = await this.embedder.embed(
      batch.map((chunk) => chunk.text),
    );
    await this.chunks.saveEmbeddings(toEmbeddedChunks(batch, embeddings));
  }

  private logFailure(documentId: string, error: unknown): void {
    const message = `Document ${documentId} failed`;
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
