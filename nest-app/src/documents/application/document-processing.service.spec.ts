import { DocumentStatus } from '@src/documents/domain/models/document-status';
import { InMemoryDocumentFileStoreAdapter } from '@src/documents/testing/in-memory-document-file-store.adapter';
import { InMemoryDocumentRepository } from '@src/documents/testing/in-memory-document.repository';
import { DocumentProcessingService } from './document-processing.service';

const UPLOADED_AT = new Date('2026-10-31T12:00:00.000Z');
const DOCUMENT_ID = '0b6f1f0e-6f5c-4a39-9d4e-2f3a1c9b7e10';
const BLOB_NAME = `${DOCUMENT_ID}/notes.txt`;
const NOTES = new TextEncoder().encode('Temporal keeps work durable.');

function setUp() {
  const documents = new InMemoryDocumentRepository(() => UPLOADED_AT);
  const files = new InMemoryDocumentFileStoreAdapter();
  const service = new DocumentProcessingService(documents, files);
  return { documents, files, service };
}

async function uploadNotes(
  documents: InMemoryDocumentRepository,
  files: InMemoryDocumentFileStoreAdapter,
  content: Uint8Array = NOTES,
): Promise<void> {
  await files.save({ name: BLOB_NAME, contentType: 'text/plain', content });
  await documents.create({
    id: DOCUMENT_ID,
    name: 'notes.txt',
    blobName: BLOB_NAME,
  });
}

function statusOfNotes(documents: InMemoryDocumentRepository): DocumentStatus {
  return documents.all().find((document) => document.id === DOCUMENT_ID)!
    .status;
}

describe('reading an uploaded document', () => {
  it('marks a readable text document as ready', async () => {
    const { documents, files, service } = setUp();
    await uploadNotes(documents, files);

    await service.process(DOCUMENT_ID);

    expect(statusOfNotes(documents)).toBe(DocumentStatus.Ready);
  });

  it('marks a document that is not UTF-8 text as failed', async () => {
    const { documents, files, service } = setUp();
    await uploadNotes(documents, files, new Uint8Array([0xc3, 0x28]));

    await service.process(DOCUMENT_ID);

    expect(statusOfNotes(documents)).toBe(DocumentStatus.Failed);
  });

  it('marks a document holding only whitespace as failed', async () => {
    const { documents, files, service } = setUp();
    await uploadNotes(documents, files, new TextEncoder().encode(' \n\t '));

    await service.process(DOCUMENT_ID);

    expect(statusOfNotes(documents)).toBe(DocumentStatus.Failed);
  });

  it('marks a document whose file has gone missing as failed', async () => {
    const { documents, files, service } = setUp();
    await uploadNotes(documents, files);
    await files.delete(BLOB_NAME);

    await service.process(DOCUMENT_ID);

    expect(statusOfNotes(documents)).toBe(DocumentStatus.Failed);
  });

  it('leaves the document processing when the file store is unreachable, so it can be retried', async () => {
    const { documents, files, service } = setUp();
    await uploadNotes(documents, files);
    files.failNextReadWith(new Error('blob storage unavailable'));

    await expect(service.process(DOCUMENT_ID)).rejects.toThrow(
      'blob storage unavailable',
    );
    expect(statusOfNotes(documents)).toBe(DocumentStatus.Processing);
  });

  it('finishes a document whose earlier reading was interrupted', async () => {
    const { documents, files, service } = setUp();
    await uploadNotes(documents, files);
    files.failNextReadWith(new Error('blob storage unavailable'));
    await service.process(DOCUMENT_ID).catch(() => undefined);

    await service.process(DOCUMENT_ID);

    expect(statusOfNotes(documents)).toBe(DocumentStatus.Ready);
  });

  it('never changes a document that has already finished', async () => {
    const { documents, files, service } = setUp();
    await uploadNotes(documents, files);
    await service.process(DOCUMENT_ID);
    await files.delete(BLOB_NAME);

    await service.process(DOCUMENT_ID);

    expect(statusOfNotes(documents)).toBe(DocumentStatus.Ready);
  });

  it('ignores a document that does not exist', async () => {
    const { documents, service } = setUp();

    await service.process(DOCUMENT_ID);

    expect(documents.all()).toEqual([]);
  });
});
