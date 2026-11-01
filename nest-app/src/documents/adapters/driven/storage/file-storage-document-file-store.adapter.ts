import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { DocumentFileNotFoundError } from '@src/documents/domain/errors/documents.errors';
import type {
  DocumentFile,
  DocumentFileStorePort,
} from '@src/documents/domain/ports/document-file-store.port';
import { DocumentsConfig } from '@src/documents/infrastructure/documents.config';
import { FileStorageService } from '@src/file-storage/application/file-storage.service';
import { FileNotFoundError } from '@src/file-storage/domain/errors/file-storage.errors';

@Injectable()
export class FileStorageDocumentFileStoreAdapter
  implements DocumentFileStorePort, OnModuleInit
{
  private readonly container: string;

  constructor(
    @Inject(FileStorageService) private readonly storage: FileStorageService,
    @Inject(DocumentsConfig) config: DocumentsConfig,
  ) {
    this.container = config.containerName;
  }

  onModuleInit(): Promise<void> {
    return this.storage.ensureContainer(this.container);
  }

  save(file: DocumentFile): Promise<void> {
    return this.storage.save(this.container, file);
  }

  async read(name: string): Promise<Uint8Array> {
    try {
      return await this.storage.read(this.container, name);
    } catch (error) {
      throw error instanceof FileNotFoundError
        ? new DocumentFileNotFoundError(name)
        : error;
    }
  }

  delete(name: string): Promise<void> {
    return this.storage.delete(this.container, name);
  }
}
