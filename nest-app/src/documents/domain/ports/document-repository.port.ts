import type {
  Document,
  NewDocument,
} from '@src/documents/domain/models/document';

export const DOCUMENT_REPOSITORY_PORT = Symbol('DOCUMENT_REPOSITORY_PORT');

export interface DocumentRepositoryPort {
  create(document: NewDocument): Promise<Document>;
  findNewest(limit: number): Promise<Document[]>;
}
