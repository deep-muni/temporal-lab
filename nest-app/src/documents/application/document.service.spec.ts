import {
  DocumentNotFoundError,
  InvalidDocumentUploadError,
} from '@src/documents/domain/errors/documents.errors';
import { InMemoryDocumentFileStoreAdapter } from '@src/documents/testing/in-memory-document-file-store.adapter';
import { InMemoryDocumentRepository } from '@src/documents/testing/in-memory-document.repository';
import { RecordingDocumentProcessorAdapter } from '@src/documents/testing/recording-document-processor.adapter';
import { DocumentService } from './document.service';

const UPLOADED_AT = new Date('2026-10-31T12:00:00.000Z');
const NOTES = new TextEncoder().encode('Temporal keeps work durable.');
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function setUp(now: () => Date = () => UPLOADED_AT) {
  const documents = new InMemoryDocumentRepository(now);
  const files = new InMemoryDocumentFileStoreAdapter();
  const processor = new RecordingDocumentProcessorAdapter();
  const service = new DocumentService(documents, files, processor);
  return { documents, files, processor, service };
}

function oneSecondApart(): () => Date {
  let tick = 0;
  return () => new Date(UPLOADED_AT.getTime() + 1_000 * tick++);
}

async function uploadTextFiles(
  service: DocumentService,
  names: string[],
): Promise<void> {
  for (const name of names) {
    await service.upload({ originalName: name, content: NOTES });
  }
}

function textFileNames(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `note-${index + 1}.txt`);
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

  it('sends an uploaded document off to be read', async () => {
    const { processor, service } = setUp();

    const document = await service.upload({
      originalName: 'notes.txt',
      content: NOTES,
    });

    expect(processor.scheduled).toEqual([document.id]);
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
    const { documents, files, processor, service } = setUp();
    documents.failNextCreateWith(new Error('database unavailable'));

    await expect(
      service.upload({ originalName: 'notes.txt', content: NOTES }),
    ).rejects.toThrow('database unavailable');
    expect(files.all()).toEqual([]);
    expect(processor.scheduled).toEqual([]);
  });
});

describe('listing documents', () => {
  it('lists nothing when no document has been uploaded', async () => {
    const { service } = setUp();

    await expect(service.list()).resolves.toEqual([]);
  });

  it('lists the most recently uploaded document first', async () => {
    const { service } = setUp(oneSecondApart());
    await uploadTextFiles(service, ['first.txt', 'second.txt', 'third.txt']);

    const documents = await service.list();

    expect(documents.map((document) => document.name)).toEqual([
      'third.txt',
      'second.txt',
      'first.txt',
    ]);
  });

  it('lists only the newest 100 documents', async () => {
    const { service } = setUp(oneSecondApart());
    await uploadTextFiles(service, textFileNames(101));

    const documents = await service.list();

    expect(documents).toHaveLength(100);
    expect(documents.at(0)?.name).toBe('note-101.txt');
    expect(documents.at(-1)?.name).toBe('note-2.txt');
  });
});

describe('deleting a document', () => {
  it('removes the document and its stored file, leaving the others', async () => {
    const { documents, files, service } = setUp();
    const notes = await service.upload({
      originalName: 'notes.txt',
      content: NOTES,
    });
    const guide = await service.upload({
      originalName: 'guide.md',
      content: NOTES,
    });

    await service.delete(notes.id);

    expect(documents.all()).toEqual([guide]);
    expect(files.all().map((file) => file.name)).toEqual([guide.blobName]);
  });

  it('refuses to delete a document that does not exist', async () => {
    const { service } = setUp();
    const missingId = '0b6f1f0e-6f5c-4a39-9d4e-2f3a1c9b7e10';

    await expect(service.delete(missingId)).rejects.toThrow(
      new DocumentNotFoundError(missingId),
    );
  });
});
