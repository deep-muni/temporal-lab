export const DOCUMENT_FILE_STORE = Symbol('DocumentFileStore');

export interface DocumentFile {
  name: string;
  contentType: string;
  content: Uint8Array;
}

export interface DocumentFileStore {
  save(file: DocumentFile): Promise<void>;
  read(name: string): Promise<Uint8Array>;
  delete(name: string): Promise<void>;
}
