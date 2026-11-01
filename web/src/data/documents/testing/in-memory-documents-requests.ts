import type { DocumentStatus, DocumentSummary } from '../document.schema';
import type { DocumentsRequests } from '../query/documents-requests';

export class InMemoryDocumentsRequests implements DocumentsRequests {
  readonly uploadedFiles: File[] = [];
  listCalls = 0;
  private documents: DocumentSummary[] = [];
  private nextListFailure: Error | undefined;
  private nextUploadRefusal: Error | undefined;
  private nextUploadGate: Promise<void> | undefined;

  seed(...documents: DocumentSummary[]): void {
    this.documents = [...documents, ...this.documents];
  }

  setStatus(id: string, status: DocumentStatus): void {
    this.documents = this.documents.map((document) =>
      document.id === id ? { ...document, status } : document,
    );
  }

  failNextListWith(error: Error): void {
    this.nextListFailure = error;
  }

  refuseNextUploadWith(error: Error): void {
    this.nextUploadRefusal = error;
  }

  holdNextUpload(): { complete(): void } {
    let complete = () => {};
    this.nextUploadGate = new Promise<void>((resolve) => {
      complete = resolve;
    });
    return { complete: () => complete() };
  }

  getAllDocuments(): Promise<DocumentSummary[]> {
    this.listCalls += 1;
    const failure = this.nextListFailure;
    this.nextListFailure = undefined;
    return failure === undefined
      ? Promise.resolve([...this.documents])
      : Promise.reject(failure);
  }

  async uploadDocument(file: File): Promise<DocumentSummary> {
    const gate = this.nextUploadGate;
    this.nextUploadGate = undefined;
    await gate;
    const refusal = this.nextUploadRefusal;
    this.nextUploadRefusal = undefined;
    if (refusal !== undefined) {
      throw refusal;
    }
    return this.accept(file);
  }

  private accept(file: File): DocumentSummary {
    const document: DocumentSummary = {
      id: crypto.randomUUID(),
      name: file.name,
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
    };
    this.uploadedFiles.push(file);
    this.documents = [document, ...this.documents];
    return document;
  }
}
