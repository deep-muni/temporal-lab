import { ApplicationFailure, heartbeat } from '@temporalio/activity';
import type { DocumentProcessingService } from '@src/documents/application/document-processing.service';
import { DocumentsDomainError } from '@src/documents/domain/errors/documents.errors';

export type DocumentProcessingActivities = ReturnType<
  typeof createDocumentProcessingActivities
>;

export function createDocumentProcessingActivities(
  processing: DocumentProcessingService,
) {
  return {
    startProcessing: (documentId: string) =>
      failFastOnDomainError(() => processing.startProcessing(documentId)),
    splitIntoChunks: (documentId: string) =>
      failFastOnDomainError(() => processing.splitIntoChunks(documentId)),
    embedChunks: (documentId: string) =>
      failFastOnDomainError(() =>
        processing.embedChunks(documentId, (embeddedSoFar) =>
          heartbeat(embeddedSoFar),
        ),
      ),
    markReady: (documentId: string) =>
      failFastOnDomainError(() => processing.markReady(documentId)),
    markFailed: (documentId: string, reason: string) =>
      failFastOnDomainError(() => processing.markFailed(documentId, reason)),
  };
}

async function failFastOnDomainError<T>(step: () => Promise<T>): Promise<T> {
  try {
    return await step();
  } catch (error) {
    if (error instanceof DocumentsDomainError) {
      throw ApplicationFailure.nonRetryable(error.message, error.name);
    }
    throw error;
  }
}
