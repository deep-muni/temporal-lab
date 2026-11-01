import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentProcessingService } from '@src/documents/application/document-processing.service';
import type { DocumentProcessorPort } from '@src/documents/domain/ports/document-processor.port';

@Injectable()
export class InProcessDocumentProcessorAdapter implements DocumentProcessorPort {
  private readonly logger = new Logger(InProcessDocumentProcessorAdapter.name);

  constructor(
    @Inject(DocumentProcessingService)
    private readonly processing: DocumentProcessingService,
  ) {}

  schedule(documentId: string): Promise<void> {
    this.processing.process(documentId).catch((error: unknown) => {
      this.logger.error(
        `Could not process document ${documentId}`,
        error instanceof Error ? error.stack : String(error),
      );
    });
    return Promise.resolve();
  }
}
