import {
  BlobServiceClient,
  RestError,
  type ContainerClient,
} from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';
import { FileNotFoundError } from '@src/file-storage/domain/errors/file-storage.errors';
import type { StoredFile } from '@src/file-storage/domain/models/stored-file';
import type { FileStorePort } from '@src/file-storage/domain/ports/file-store.port';

const HTTP_NOT_FOUND = 404;

@Injectable()
export class AzureBlobFileStoreAdapter implements FileStorePort {
  constructor(
    @Inject(BlobServiceClient) private readonly blobService: BlobServiceClient,
  ) {}

  async ensureContainer(container: string): Promise<void> {
    await this.containerClient(container).createIfNotExists();
  }

  async save(container: string, file: StoredFile): Promise<void> {
    await this.containerClient(container)
      .getBlockBlobClient(file.name)
      .uploadData(file.content, {
        blobHTTPHeaders: { blobContentType: file.contentType },
      });
  }

  async read(container: string, name: string): Promise<Uint8Array> {
    try {
      return await this.containerClient(container)
        .getBlockBlobClient(name)
        .downloadToBuffer();
    } catch (error) {
      throw isNotFound(error) ? new FileNotFoundError(container, name) : error;
    }
  }

  async delete(container: string, name: string): Promise<void> {
    await this.containerClient(container)
      .getBlockBlobClient(name)
      .deleteIfExists();
  }

  private containerClient(container: string): ContainerClient {
    return this.blobService.getContainerClient(container);
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof RestError && error.statusCode === HTTP_NOT_FOUND;
}
