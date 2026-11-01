import { createApiClient } from '@/lib/http/api-client';
import { nestJsErrorOf } from '@/lib/http/nest-js-error';
import { CannedServer } from '@/testing/canned-server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DocumentSummary } from '../document.schema';
import {
  createDocumentsRequests,
  type DocumentsRequests,
} from './documents-requests';

const NEWER: DocumentSummary = {
  id: '6a73b079-fad4-4a5b-b806-29c6d3e09f67',
  name: 'guide.md',
  status: 'processing',
  uploadedAt: '2026-11-01T10:05:00.000Z',
};
const OLDER: DocumentSummary = {
  id: '03c543e9-c281-4356-96d5-195248dfed4a',
  name: 'notes.txt',
  status: 'ready',
  uploadedAt: '2026-11-01T09:00:00.000Z',
};

describe('talking to the documents API', () => {
  let server: CannedServer;
  let requests: DocumentsRequests;

  beforeEach(async () => {
    server = new CannedServer();
    requests = createDocumentsRequests(createApiClient(await server.start()));
  });

  afterEach(async () => {
    await server.stop();
  });

  it('lists documents newest first exactly as the API sends them', async () => {
    server.respondTo('GET', '/documents', 200, { documents: [NEWER, OLDER] });

    await expect(requests.getAllDocuments()).resolves.toEqual([NEWER, OLDER]);
  });

  it('lists nothing for an empty library', async () => {
    server.respondTo('GET', '/documents', 200, { documents: [] });

    await expect(requests.getAllDocuments()).resolves.toEqual([]);
  });

  it('refuses a list with a status it does not know as a contract change', async () => {
    server.respondTo('GET', '/documents', 200, {
      documents: [{ ...NEWER, status: 'archived' }],
    });

    await expect(requests.getAllDocuments()).rejects.toThrow(/status/);
  });

  it('sends an upload as the multipart field "file" and returns the accepted document', async () => {
    server.respondTo('POST', '/documents', 202, {
      ...NEWER,
      status: 'uploaded',
    });

    const accepted = await requests.uploadDocument(
      new File(['# Durable work'], 'guide.md', { type: 'text/markdown' }),
    );

    expect(accepted).toEqual({ ...NEWER, status: 'uploaded' });
    expect(server.lastRequest()?.contentType).toMatch(/^multipart\/form-data/);
    expect(server.lastRequest()?.body.toString()).toContain(
      'name="file"; filename="guide.md"',
    );
  });

  it('surfaces a refused upload with the API answer', async () => {
    server.respondTo('POST', '/documents', 400, {
      statusCode: 400,
      message: 'Only .txt and .md files can be uploaded',
      error: 'Bad Request',
    });

    const error = await requests
      .uploadDocument(new File(['%PDF'], 'report.pdf'))
      .catch((reason: unknown) => reason);

    expect(nestJsErrorOf(error)).toEqual({
      status: 400,
      message: 'Only .txt and .md files can be uploaded',
    });
  });

  it('deletes a document by its id', async () => {
    server.respondTo('DELETE', `/documents/${OLDER.id}`, 204, undefined);

    await expect(requests.deleteDocument(OLDER.id)).resolves.toBeUndefined();
    expect(server.lastRequest()?.method).toBe('DELETE');
  });

  it('surfaces a delete of a document that no longer exists', async () => {
    server.respondTo('DELETE', `/documents/${OLDER.id}`, 404, {
      statusCode: 404,
      message: `Document ${OLDER.id} was not found`,
      error: 'Not Found',
    });

    const error = await requests
      .deleteDocument(OLDER.id)
      .catch((reason: unknown) => reason);

    expect(nestJsErrorOf(error)?.status).toBe(404);
  });
});
