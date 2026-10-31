import type {
  Document,
  NewDocument,
} from '@src/documents/domain/models/document';
import { DocumentStatus } from '@src/documents/domain/models/document-status';
import type { DocumentRepositoryPort } from '@src/documents/domain/ports/document-repository.port';

export class InMemoryDocumentRepository implements DocumentRepositoryPort {
  private readonly documents = new Map<string, Document>();
  private nextCreateFailure: Error | undefined;

  constructor(private readonly now: () => Date = () => new Date()) {}

  failNextCreateWith(error: Error): void {
    this.nextCreateFailure = error;
  }

  create(newDocument: NewDocument): Promise<Document> {
    const failure = this.nextCreateFailure;
    this.nextCreateFailure = undefined;
    if (failure) {
      return Promise.reject(failure);
    }
    const timestamp = this.now();
    const document: Document = {
      ...newDocument,
      status: DocumentStatus.Uploaded,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.documents.set(document.id, document);
    return Promise.resolve(document);
  }

  all(): Document[] {
    return [...this.documents.values()];
  }
}
