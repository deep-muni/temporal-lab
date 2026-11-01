import type { StoredFile } from '@src/file-storage/domain/models/stored-file';

export const FILE_STORE_PORT = Symbol('FILE_STORE_PORT');

export interface FileStorePort {
  ensureContainer(container: string): Promise<void>;
  save(container: string, file: StoredFile): Promise<void>;
  read(container: string, name: string): Promise<Uint8Array>;
  delete(container: string, name: string): Promise<void>;
}
