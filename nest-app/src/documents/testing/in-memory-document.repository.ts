import type {
  Document,
  NewDocument,
} from '@src/documents/domain/models/document';
import {
  DocumentStatus,
  type FinishedDocumentStatus,
} from '@src/documents/domain/models/document-status';
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

  findNewest(limit: number): Promise<Document[]> {
    const newestFirst = this.all().sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return Promise.resolve(newestFirst.slice(0, limit));
  }

  startProcessing(id: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document || isFinished(document.status)) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(
      this.changeStatus(document, DocumentStatus.Processing),
    );
  }

  finishProcessing(id: string, status: FinishedDocumentStatus): Promise<void> {
    const document = this.documents.get(id);
    if (document?.status === DocumentStatus.Processing) {
      this.changeStatus(document, status);
    }
    return Promise.resolve();
  }

  delete(id: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    this.documents.delete(id);
    return Promise.resolve(document);
  }

  all(): Document[] {
    return [...this.documents.values()];
  }

  private changeStatus(document: Document, status: DocumentStatus): Document {
    const changed = { ...document, status, updatedAt: this.now() };
    this.documents.set(changed.id, changed);
    return changed;
  }
}

function isFinished(status: DocumentStatus): boolean {
  return status === DocumentStatus.Ready || status === DocumentStatus.Failed;
}
