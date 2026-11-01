import type {
  Document,
  NewDocument,
} from '@src/documents/domain/models/document';
import type { FinishedDocumentStatus } from '@src/documents/domain/models/document-status';

export const DOCUMENT_REPOSITORY_PORT = Symbol('DOCUMENT_REPOSITORY_PORT');

export interface DocumentRepositoryPort {
  create(document: NewDocument): Promise<Document>;
  findNewest(limit: number): Promise<Document[]>;
  startProcessing(id: string): Promise<Document | undefined>;
  finishProcessing(id: string, status: FinishedDocumentStatus): Promise<void>;
}
