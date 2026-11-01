import type { DocumentProcessorPort } from '@src/documents/domain/ports/document-processor.port';

export class RecordingDocumentProcessorAdapter implements DocumentProcessorPort {
  readonly scheduled: string[] = [];

  schedule(documentId: string): Promise<void> {
    this.scheduled.push(documentId);
    return Promise.resolve();
  }
}
