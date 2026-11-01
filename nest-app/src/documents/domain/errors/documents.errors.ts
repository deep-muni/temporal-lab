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

export class DocumentNotFoundError extends DocumentsDomainError {
  override readonly name = 'DocumentNotFoundError';

  constructor(readonly documentId: string) {
    super(`Document ${documentId} was not found`);
  }
}

export class DocumentNotFullyEmbeddedError extends DocumentsDomainError {
  override readonly name = 'DocumentNotFullyEmbeddedError';

  constructor(
    readonly documentId: string,
    readonly pendingChunks: number,
  ) {
    super(
      `Document ${documentId} still has ${pendingChunks} chunks without an embedding`,
    );
  }
}
