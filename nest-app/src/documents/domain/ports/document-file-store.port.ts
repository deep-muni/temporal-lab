export const DOCUMENT_FILE_STORE_PORT = Symbol('DOCUMENT_FILE_STORE_PORT');

export interface DocumentFile {
  name: string;
  contentType: string;
  content: Uint8Array;
}

export interface DocumentFileStorePort {
  save(file: DocumentFile): Promise<void>;
  read(name: string): Promise<Uint8Array>;
  delete(name: string): Promise<void>;
}
