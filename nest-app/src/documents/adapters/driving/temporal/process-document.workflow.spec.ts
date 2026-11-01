import { randomUUID } from 'node:crypto';
import path from 'node:path';
import {
  ActivityFailure,
  ApplicationFailure,
  WorkflowFailedError,
} from '@temporalio/client';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import {
  bundleWorkflowCode,
  DefaultLogger,
  Runtime,
  Worker,
  type WorkflowBundleWithSourceMap,
} from '@temporalio/worker';
import { DocumentProcessingService } from '@src/documents/application/document-processing.service';
import { DocumentStatus } from '@src/documents/domain/models/document-status';
import { DocumentsConfig } from '@src/documents/infrastructure/documents.config';
import { InMemoryDocumentChunkRepository } from '@src/documents/testing/in-memory-document-chunk.repository';
import { InMemoryDocumentFileStoreAdapter } from '@src/documents/testing/in-memory-document-file-store.adapter';
import { InMemoryDocumentRepository } from '@src/documents/testing/in-memory-document.repository';
import {
  embeddingOf,
  InMemoryEmbeddingAdapter,
} from '@src/documents/testing/in-memory-embedding.adapter';
import { InMemoryTextChunkerAdapter } from '@src/documents/testing/in-memory-text-chunker.adapter';
import { InMemoryTransactionalContextAdapter } from '@src/documents/testing/in-memory-transactional-context.adapter';
import { createDocumentProcessingActivities } from './document-processing.activities';
import { processDocument } from './process-document.workflow';

const TEMPORAL_SERVER_STARTUP_MS = 120_000;
const DOCUMENT_ID = '0b6f1f0e-6f5c-4a39-9d4e-2f3a1c9b7e10';
const SECTIONS = [
  '# Durable work',
  'Temporal records every step of a workflow.',
  'Failed activities are retried with backoff.',
];

Runtime.install({ logger: new DefaultLogger('WARN') });

let env: TestWorkflowEnvironment;
let workflowBundle: WorkflowBundleWithSourceMap;

beforeAll(async () => {
  env = await TestWorkflowEnvironment.createTimeSkipping();
  workflowBundle = await bundleWorkflowCode({
    workflowsPath: path.join(__dirname, 'process-document.workflow.ts'),
    logger: new DefaultLogger('WARN'),
  });
}, TEMPORAL_SERVER_STARTUP_MS);

afterAll(async () => {
  await env?.teardown();
});

function setUp() {
  const documents = new InMemoryDocumentRepository();
  const files = new InMemoryDocumentFileStoreAdapter();
  const embedder = new InMemoryEmbeddingAdapter();
  const chunks = new InMemoryDocumentChunkRepository();
  const service = new DocumentProcessingService(
    documents,
    files,
    new InMemoryTextChunkerAdapter(),
    embedder,
    chunks,
    new InMemoryTransactionalContextAdapter(),
    DocumentsConfig.fromEnv({}),
  );
  return { documents, files, embedder, chunks, service };
}

async function upload(
  { documents, files }: ReturnType<typeof setUp>,
  content: string | Uint8Array,
): Promise<void> {
  const blobName = `${DOCUMENT_ID}/guide.md`;
  await files.save({
    name: blobName,
    contentType: 'text/markdown',
    content:
      typeof content === 'string' ? new TextEncoder().encode(content) : content,
  });
  await documents.create({ id: DOCUMENT_ID, name: 'guide.md', blobName });
}

async function runProcessDocument(
  context: ReturnType<typeof setUp>,
): Promise<void> {
  const taskQueue = `process-document-${randomUUID()}`;
  const worker = await Worker.create({
    connection: env.nativeConnection,
    taskQueue,
    workflowBundle,
    activities: createDocumentProcessingActivities(context.service),
  });
  await worker.runUntil(
    env.client.workflow.execute(processDocument, {
      args: [DOCUMENT_ID],
      workflowId: `process-document-${randomUUID()}`,
      taskQueue,
    }),
  );
}

function statusOf(documents: InMemoryDocumentRepository): DocumentStatus {
  return documents.all().find((document) => document.id === DOCUMENT_ID)!
    .status;
}

function rootCauseOf(error: unknown): unknown {
  return error instanceof WorkflowFailedError &&
    error.cause instanceof ActivityFailure
    ? error.cause.cause
    : undefined;
}

describe('processing a document as a Temporal workflow', () => {
  it('reads, embeds and marks a document ready', async () => {
    const context = setUp();
    await upload(context, SECTIONS.join('\n\n'));

    await runProcessDocument(context);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Ready);
    expect(context.chunks.of(DOCUMENT_ID)).toEqual(
      SECTIONS.map((text, position) => ({
        position,
        text,
        embedding: embeddingOf(text),
      })),
    );
  });

  it('rides out a brief embedding model outage by retrying and still marks the document ready', async () => {
    const context = setUp();
    await upload(context, SECTIONS.join('\n\n'));
    context.embedder.failNextWith(new Error('embedding unavailable'));

    await runProcessDocument(context);

    expect(statusOf(context.documents)).toBe(DocumentStatus.Ready);
  });

  it('marks the document failed when the embedding model stays down through every retry', async () => {
    const context = setUp();
    await upload(context, SECTIONS.join('\n\n'));
    context.embedder.failEveryCallWith(new Error('embedding unavailable'));

    const failure = await runProcessDocument(context).catch(
      (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(WorkflowFailedError);
    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
    expect(context.chunks.of(DOCUMENT_ID)).toEqual([]);
  });

  it('gives up on a file that is not UTF-8 text without retrying and marks it failed', async () => {
    const context = setUp();
    await upload(context, new Uint8Array([0xc3, 0x28]));

    const failure = await runProcessDocument(context).catch(
      (error: unknown) => error,
    );

    expect(rootCauseOf(failure)).toMatchObject({
      type: 'UnreadableDocumentError',
      nonRetryable: true,
    });
    expect(rootCauseOf(failure)).toBeInstanceOf(ApplicationFailure);
    expect(statusOf(context.documents)).toBe(DocumentStatus.Failed);
  });
});
