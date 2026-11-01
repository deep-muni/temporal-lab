export abstract class DocumentsDomainError extends Error {}

export class InvalidDocumentUploadError extends DocumentsDomainError {
  override readonly name = 'InvalidDocumentUploadError';
}

export class DocumentFileNotFoundError extends DocumentsDomainError {
  override readonly name = 'DocumentFileNotFoundError';

  constructor(readonly fileName: string) {
    super(`Document file ${fileName} was not found`);
  }
}

export class UnreadableDocumentError extends DocumentsDomainError {
  override readonly name = 'UnreadableDocumentError';
}
