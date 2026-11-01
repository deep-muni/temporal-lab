import { DocumentFileNotFoundError } from '@src/documents/domain/errors/documents.errors';
import type {
  DocumentFile,
  DocumentFileStorePort,
} from '@src/documents/domain/ports/document-file-store.port';

export class InMemoryDocumentFileStoreAdapter implements DocumentFileStorePort {
  private readonly files = new Map<string, DocumentFile>();
  private nextReadFailure: Error | undefined;

  failNextReadWith(error: Error): void {
    this.nextReadFailure = error;
  }

  save(file: DocumentFile): Promise<void> {
    this.files.set(file.name, file);
    return Promise.resolve();
  }

  read(name: string): Promise<Uint8Array> {
    const failure = this.nextReadFailure;
    this.nextReadFailure = undefined;
    if (failure) {
      return Promise.reject(failure);
    }
    const file = this.files.get(name);
    return file
      ? Promise.resolve(file.content)
      : Promise.reject(new DocumentFileNotFoundError(name));
  }

  delete(name: string): Promise<void> {
    this.files.delete(name);
    return Promise.resolve();
  }

  all(): DocumentFile[] {
    return [...this.files.values()];
  }
}
