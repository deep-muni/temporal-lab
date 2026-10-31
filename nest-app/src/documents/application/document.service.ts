import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  Document,
  NewDocument,
} from '@src/documents/domain/models/document';
import {
  toDocumentUpload,
  type IncomingDocumentFile,
} from '@src/documents/domain/models/document-upload';
import {
  DOCUMENT_FILE_STORE_PORT,
  type DocumentFileStorePort,
} from '@src/documents/domain/ports/document-file-store.port';
import {
  DOCUMENT_REPOSITORY_PORT,
  type DocumentRepositoryPort,
} from '@src/documents/domain/ports/document-repository.port';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY_PORT)
    private readonly documents: DocumentRepositoryPort,
    @Inject(DOCUMENT_FILE_STORE_PORT)
    private readonly files: DocumentFileStorePort,
  ) {}

  async upload(file: IncomingDocumentFile | undefined): Promise<Document> {
    const upload = toDocumentUpload(file);
    const id = randomUUID();
    const blobName = `${id}/${upload.name}`;
    await this.files.save({
      name: blobName,
      contentType: upload.contentType,
      content: upload.content,
    });
    return this.recordOrDiscardFile({ id, name: upload.name, blobName });
  }

  private async recordOrDiscardFile(document: NewDocument): Promise<Document> {
    try {
      return await this.documents.create(document);
    } catch (error) {
      await this.discardFile(document.blobName);
      throw error;
    }
  }

  private async discardFile(blobName: string): Promise<void> {
    try {
      await this.files.delete(blobName);
    } catch (error) {
      this.logger.error(
        `Could not remove orphaned document file ${blobName}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
