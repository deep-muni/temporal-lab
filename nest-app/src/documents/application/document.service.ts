import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentNotFoundError } from '@src/documents/domain/errors/documents.errors';
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
  DOCUMENT_PROCESSOR_PORT,
  type DocumentProcessorPort,
} from '@src/documents/domain/ports/document-processor.port';
import {
  DOCUMENT_REPOSITORY_PORT,
  type DocumentRepositoryPort,
} from '@src/documents/domain/ports/document-repository.port';

export const DOCUMENT_LIST_LIMIT = 100;

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY_PORT)
    private readonly documents: DocumentRepositoryPort,
    @Inject(DOCUMENT_FILE_STORE_PORT)
    private readonly files: DocumentFileStorePort,
    @Inject(DOCUMENT_PROCESSOR_PORT)
    private readonly processor: DocumentProcessorPort,
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
    const document = await this.recordOrDiscardFile({
      id,
      name: upload.name,
      blobName,
    });
    await this.processor.schedule(document.id);
    return document;
  }

  list(): Promise<Document[]> {
    return this.documents.findNewest(DOCUMENT_LIST_LIMIT);
  }

  async delete(id: string): Promise<void> {
    const document = await this.documents.delete(id);
    if (!document) {
      throw new DocumentNotFoundError(id);
    }
    await this.discardFile(document.blobName);
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
        `Could not remove document file ${blobName}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
