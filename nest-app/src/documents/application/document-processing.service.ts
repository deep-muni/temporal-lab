import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentsDomainError } from '@src/documents/domain/errors/documents.errors';
import type { Document } from '@src/documents/domain/models/document';
import {
  DocumentStatus,
  type FinishedDocumentStatus,
} from '@src/documents/domain/models/document-status';
import { toDocumentText } from '@src/documents/domain/models/document-text';
import {
  DOCUMENT_FILE_STORE_PORT,
  type DocumentFileStorePort,
} from '@src/documents/domain/ports/document-file-store.port';
import {
  DOCUMENT_REPOSITORY_PORT,
  type DocumentRepositoryPort,
} from '@src/documents/domain/ports/document-repository.port';

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY_PORT)
    private readonly documents: DocumentRepositoryPort,
    @Inject(DOCUMENT_FILE_STORE_PORT)
    private readonly files: DocumentFileStorePort,
  ) {}

  async process(documentId: string): Promise<void> {
    const document = await this.documents.startProcessing(documentId);
    if (!document) {
      return;
    }
    const status = await this.read(document);
    await this.documents.finishProcessing(document.id, status);
  }

  private async read(document: Document): Promise<FinishedDocumentStatus> {
    try {
      toDocumentText(await this.files.read(document.blobName));
      return DocumentStatus.Ready;
    } catch (error) {
      if (!(error instanceof DocumentsDomainError)) {
        throw error;
      }
      this.logger.warn(`Document ${document.id} failed: ${error.message}`);
      return DocumentStatus.Failed;
    }
  }
}
