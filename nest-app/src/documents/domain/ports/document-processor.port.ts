export const DOCUMENT_PROCESSOR_PORT = Symbol('DOCUMENT_PROCESSOR_PORT');

export interface DocumentProcessorPort {
  schedule(documentId: string): Promise<void>;
}
