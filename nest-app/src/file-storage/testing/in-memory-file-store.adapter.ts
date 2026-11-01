import { FileNotFoundError } from '@src/file-storage/domain/errors/file-storage.errors';
import type { StoredFile } from '@src/file-storage/domain/models/stored-file';
import type { FileStorePort } from '@src/file-storage/domain/ports/file-store.port';

export class InMemoryFileStoreAdapter implements FileStorePort {
  private readonly containers = new Map<string, Map<string, StoredFile>>();

  ensureContainer(container: string): Promise<void> {
    this.filesIn(container);
    return Promise.resolve();
  }

  save(container: string, file: StoredFile): Promise<void> {
    this.filesIn(container).set(file.name, file);
    return Promise.resolve();
  }

  read(container: string, name: string): Promise<Uint8Array> {
    const file = this.filesIn(container).get(name);
    return file
      ? Promise.resolve(file.content)
      : Promise.reject(new FileNotFoundError(container, name));
  }

  delete(container: string, name: string): Promise<void> {
    this.filesIn(container).delete(name);
    return Promise.resolve();
  }

  private filesIn(container: string): Map<string, StoredFile> {
    const files =
      this.containers.get(container) ?? new Map<string, StoredFile>();
    this.containers.set(container, files);
    return files;
  }
}
