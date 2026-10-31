export const DOCUMENT_FILE_NOT_FOUND = 'DocumentFileNotFoundError';

export class DocumentFileNotFoundError extends Error {
  override readonly name = DOCUMENT_FILE_NOT_FOUND;

  constructor(readonly fileName: string) {
    super(`Document file ${fileName} was not found`);
  }
}
