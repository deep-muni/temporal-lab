import { RestError, type ContainerClient } from '@azure/storage-blob';
import type { OnModuleInit } from '@nestjs/common';
import { DocumentFileNotFoundError } from '@src/documents/domain/errors/document-file.errors';
import type {
  DocumentFile,
  DocumentFileStore,
} from '@src/documents/domain/ports/document-file-store.port';

const HTTP_NOT_FOUND = 404;

export class AzureBlobDocumentFileStoreAdapter
  implements DocumentFileStore, OnModuleInit
{
  constructor(private readonly container: ContainerClient) {}

  async onModuleInit(): Promise<void> {
    await this.container.createIfNotExists();
  }

  async save(file: DocumentFile): Promise<void> {
    await this.container
      .getBlockBlobClient(file.name)
      .uploadData(file.content, {
        blobHTTPHeaders: { blobContentType: file.contentType },
      });
  }

  async read(name: string): Promise<Uint8Array> {
    try {
      return await this.container.getBlockBlobClient(name).downloadToBuffer();
    } catch (error) {
      throw isNotFound(error) ? new DocumentFileNotFoundError(name) : error;
    }
  }

  async delete(name: string): Promise<void> {
    await this.container.getBlockBlobClient(name).deleteIfExists();
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof RestError && error.statusCode === HTTP_NOT_FOUND;
}
