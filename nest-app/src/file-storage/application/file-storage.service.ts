import { Inject, Injectable } from '@nestjs/common';
import type { StoredFile } from '@src/file-storage/domain/models/stored-file';
import {
  FILE_STORE_PORT,
  type FileStorePort,
} from '@src/file-storage/domain/ports/file-store.port';

@Injectable()
export class FileStorageService {
  constructor(@Inject(FILE_STORE_PORT) private readonly store: FileStorePort) {}

  ensureContainer(container: string): Promise<void> {
    return this.store.ensureContainer(container);
  }

  save(container: string, file: StoredFile): Promise<void> {
    return this.store.save(container, file);
  }

  read(container: string, name: string): Promise<Uint8Array> {
    return this.store.read(container, name);
  }

  delete(container: string, name: string): Promise<void> {
    return this.store.delete(container, name);
  }
}
