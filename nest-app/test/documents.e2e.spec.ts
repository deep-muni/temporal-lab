import type { INestApplication } from '@nestjs/common';
import type { DocumentStatus } from '@src/documents/domain/models/document-status';
import type { PrismaService } from '@src/lib/database/prisma.service';
import { documentsApi } from './api/documents.api';
import { createE2eApp } from './support/e2e-app';

const DURABLE_WORK =
  '# Durable work\n\nTemporal records every step of a workflow in its event history.';
const RETRIES =
  '## Retries\n\nFailed activities are retried with exponential backoff until they succeed.';
const GUIDE = `${DURABLE_WORK}\n\n${RETRIES}`;
const NOT_UTF8 = Buffer.from([0xc3, 0x28]);
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

interface StoredChunk {
  position: number;
  text: string;
  dimensions: number;
  firstValue: number;
}

describe('uploading documents (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let api: ReturnType<typeof documentsApi>;

  beforeAll(async () => {
    ({ app, prisma } = await createE2eApp());
    api = documentsApi(app);
  });

  beforeEach(async () => {
    await prisma.document.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  const statusOf = async (documentId: string): Promise<DocumentStatus> => {
    const { body } = await api.list();
    return body.documents.find((document) => document.id === documentId)!
      .status;
  };

  const storedChunksOf = (documentId: string) =>
    prisma.$queryRaw<StoredChunk[]>`
      SELECT "position", "text",
             vector_dims("embedding") AS "dimensions",
             ("embedding"::real[])[1] AS "firstValue"
      FROM "document_chunks"
      WHERE "documentId" = ${documentId}::uuid
      ORDER BY "position"`;

  it('a markdown guide is accepted, read in the background, split at its headings and stored as embedded chunks', async () => {
    const upload = await api.upload('guide.md', GUIDE);

    expect(upload.status).toBe(202);
    expect(upload.body.id).toMatch(UUID);
    expect(upload.body).toEqual({
      id: upload.body.id,
      name: 'guide.md',
      status: 'uploaded',
      uploadedAt: upload.body.uploadedAt,
    });
    await expect.poll(() => statusOf(upload.body.id)).toBe('ready');
    await expect(api.list()).resolves.toEqual({
      status: 200,
      body: { documents: [{ ...upload.body, status: 'ready' }] },
    });
    await expect(storedChunksOf(upload.body.id)).resolves.toEqual([
      {
        position: 0,
        text: DURABLE_WORK,
        dimensions: 1024,
        firstValue: DURABLE_WORK.length,
      },
      {
        position: 1,
        text: RETRIES,
        dimensions: 1024,
        firstValue: RETRIES.length,
      },
    ]);
  });

  it('a file that is not UTF-8 text is accepted, then marked failed with nothing stored to search', async () => {
    const upload = await api.upload('notes.txt', NOT_UTF8);

    expect(upload.status).toBe(202);
    await expect.poll(() => statusOf(upload.body.id)).toBe('failed');
    await expect(storedChunksOf(upload.body.id)).resolves.toEqual([]);
  });
});
