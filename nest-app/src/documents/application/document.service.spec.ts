import { InvalidDocumentUploadError } from '@src/documents/domain/errors/documents.errors';
import { InMemoryDocumentFileStoreAdapter } from '@src/documents/testing/in-memory-document-file-store.adapter';
import { InMemoryDocumentRepository } from '@src/documents/testing/in-memory-document.repository';
import { DocumentService } from './document.service';

const UPLOADED_AT = new Date('2026-10-31T12:00:00.000Z');
const NOTES = new TextEncoder().encode('Temporal keeps work durable.');
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function setUp() {
  const documents = new InMemoryDocumentRepository(() => UPLOADED_AT);
  const files = new InMemoryDocumentFileStoreAdapter();
  const service = new DocumentService(documents, files);
  return { documents, files, service };
}

describe('uploading a document', () => {
  it('stores a text file and records it as uploaded', async () => {
    const { documents, files, service } = setUp();

    const document = await service.upload({
      originalName: 'notes.txt',
      content: NOTES,
    });

    expect(document.id).toMatch(UUID);
    expect(document).toEqual({
      id: document.id,
      name: 'notes.txt',
      blobName: `${document.id}/notes.txt`,
      status: 'uploaded',
      createdAt: UPLOADED_AT,
      updatedAt: UPLOADED_AT,
    });
    expect(documents.all()).toEqual([document]);
    expect(files.all()).toEqual([
      {
        name: `${document.id}/notes.txt`,
        contentType: 'text/plain',
        content: NOTES,
      },
    ]);
  });

  it('accepts a markdown file and stores it as markdown', async () => {
    const { files, service } = setUp();

    await service.upload({ originalName: 'README.MD', content: NOTES });

    expect(files.all()).toEqual([
      expect.objectContaining({ contentType: 'text/markdown' }),
    ]);
  });

  it('keeps only the base name when the file name carries a path', async () => {
    const { service } = setUp();

    const document = await service.upload({
      originalName: '../../reports\\q3/summary.txt',
      content: NOTES,
    });

    expect(document.name).toBe('summary.txt');
  });

  it('refuses a PDF and stores nothing', async () => {
    const { documents, files, service } = setUp();

    await expect(
      service.upload({ originalName: 'report.pdf', content: NOTES }),
    ).rejects.toThrow(
      new InvalidDocumentUploadError('Only .txt and .md files can be uploaded'),
    );
    expect(documents.all()).toEqual([]);
    expect(files.all()).toEqual([]);
  });

  it('refuses an empty file and stores nothing', async () => {
    const { documents, files, service } = setUp();

    await expect(
      service.upload({ originalName: 'empty.txt', content: new Uint8Array() }),
    ).rejects.toThrow(new InvalidDocumentUploadError('The file is empty'));
    expect(documents.all()).toEqual([]);
    expect(files.all()).toEqual([]);
  });

  it('refuses an upload without a file', async () => {
    const { service } = setUp();

    await expect(service.upload(undefined)).rejects.toThrow(
      new InvalidDocumentUploadError('Choose a file to upload'),
    );
  });

  it('refuses a file whose name is only a path', async () => {
    const { service } = setUp();

    await expect(
      service.upload({ originalName: 'reports/', content: NOTES }),
    ).rejects.toThrow(InvalidDocumentUploadError);
  });

  it('removes the stored file when the document cannot be recorded', async () => {
    const { documents, files, service } = setUp();
    documents.failNextCreateWith(new Error('database unavailable'));

    await expect(
      service.upload({ originalName: 'notes.txt', content: NOTES }),
    ).rejects.toThrow('database unavailable');
    expect(files.all()).toEqual([]);
  });
});
