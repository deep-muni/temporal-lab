import { DocumentStatus } from '@src/documents/domain/models/document-status';
import { InMemoryDocumentChunkRepository } from '@src/documents/testing/in-memory-document-chunk.repository';
import { InMemoryDocumentFileStoreAdapter } from '@src/documents/testing/in-memory-document-file-store.adapter';
import { InMemoryDocumentRepository } from '@src/documents/testing/in-memory-document.repository';
import {
  embeddingOf,
  InMemoryEmbeddingAdapter,
} from '@src/documents/testing/in-memory-embedding.adapter';
import { InMemoryTextChunkerAdapter } from '@src/documents/testing/in-memory-text-chunker.adapter';
import { InMemoryTransactionalContextAdapter } from '@src/documents/testing/in-memory-transactional-context.adapter';
import { DocumentProcessingService } from './document-processing.service';

const UPLOADED_AT = new Date('2026-10-31T12:00:00.000Z');
const DOCUMENT_ID = '0b6f1f0e-6f5c-4a39-9d4e-2f3a1c9b7e10';
const NOTE = 'Temporal keeps work durable.';
const SECTIONS = [
  '# Durable work',
  'Temporal records every step of a workflow.',
  'Failed activities are retried with backoff.',
];

function setUp() {
  const documents = new InMemoryDocumentRepository(() => UPLOADED_AT);
  const files = new InMemoryDocumentFileStoreAdapter();
  const chunker = new InMemoryTextChunkerAdapter();
  const embedder = new InMemoryEmbeddingAdapter();
  const chunks = new InMemoryDocumentChunkRepository();
  const service = new DocumentProcessingService(
    documents,
    files,
    chunker,
    embedder,
    chunks,
    new InMemoryTransactionalContextAdapter(),
  );
  return { documents, files, chunker, embedder, chunks, service };
}

async function upload(
  { documents, files }: ReturnType<typeof setUp>,
  name: string,
  content: string | Uint8Array,
): Promise<string> {
  const blobName = `${DOCUMENT_ID}/${name}`;
  await files.save({
    name: blobName,
    contentType: 'text/plain',
    content:
      typeof content === 'string' ? new TextEncoder().encode(content) : content,
  });
  await documents.create({ id: DOCUMENT_ID, name, blobName });
  return blobName;
}

function statusOf(documents: InMemoryDocumentRepository): DocumentStatus {
  return documents.all().find((document) => document.id === DOCUMENT_ID)!
    .status;
}

describe('indexing an uploaded document', () => {
  it('stores a short note as one embedded chunk and marks it ready', async () => {
    const context = setUp();
    await upload(context, 'notes.txt', NOTE);

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Ready);
    expect(context.chunks.of(DOCUMENT_ID)).toEqual([
      { position: 0, text: NOTE, embedding: embeddingOf(NOTE) },
    ]);
  });

  it('stores every chunk with its own embedding in reading order', async () => {
    const context = setUp();
    await upload(context, 'guide.md', SECTIONS.join('\n\n'));

    await context.service.process(DOCUMENT_ID);

    expect(context.chunks.of(DOCUMENT_ID)).toEqual(
      SECTIONS.map((text, position) => ({
        position,
        text,
        embedding: embeddingOf(text),
      })),
    );
  });

  it('chunks a markdown document as markdown', async () => {
    const context = setUp();
    await upload(context, 'guide.md', SECTIONS.join('\n\n'));

    await context.service.process(DOCUMENT_ID);

    expect(context.chunker.requests).toEqual([
      { text: SECTIONS.join('\n\n'), contentType: 'text/markdown' },
    ]);
  });

  it('marks the document failed with no chunks when the embedding model is unavailable', async () => {
    const context = setUp();
    await upload(context, 'notes.txt', NOTE);
    context.embedder.failNextWith(new Error('embedding unavailable'));

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
    expect(context.chunks.of(DOCUMENT_ID)).toEqual([]);
  });

  it('refuses embeddings that do not fit the stored vector size and marks the document failed', async () => {
    const context = setUp();
    await upload(context, 'notes.txt', NOTE);
    context.embedder.answerWithDimensions(768);

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
    expect(context.chunks.of(DOCUMENT_ID)).toEqual([]);
  });
});

describe('reading an uploaded document', () => {
  it('marks a document that is not UTF-8 text as failed without storing chunks', async () => {
    const context = setUp();
    await upload(context, 'notes.txt', new Uint8Array([0xc3, 0x28]));

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
    expect(context.chunks.of(DOCUMENT_ID)).toEqual([]);
  });

  it('marks a document holding only whitespace as failed', async () => {
    const context = setUp();
    await upload(context, 'notes.txt', ' \n\t ');

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
  });

  it('marks a document whose file has gone missing as failed', async () => {
    const context = setUp();
    const blobName = await upload(context, 'notes.txt', NOTE);
    await context.files.delete(blobName);

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
  });

  it('marks the document failed when the file store is unreachable', async () => {
    const context = setUp();
    await upload(context, 'notes.txt', NOTE);
    context.files.failNextReadWith(new Error('blob storage unavailable'));

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
  });

  it('finishes a document whose earlier reading was interrupted', async () => {
    const context = setUp();
    await upload(context, 'notes.txt', NOTE);
    await context.documents.startProcessing(DOCUMENT_ID);

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Ready);
  });

  it('never changes a document that has already finished', async () => {
    const context = setUp();
    const blobName = await upload(context, 'notes.txt', NOTE);
    await context.service.process(DOCUMENT_ID);
    await context.files.delete(blobName);

    await context.service.process(DOCUMENT_ID);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Ready);
  });

  it('ignores a document that does not exist', async () => {
    const { documents, service } = setUp();

    await service.process(DOCUMENT_ID);

    expect(documents.all()).toEqual([]);
  });
});
