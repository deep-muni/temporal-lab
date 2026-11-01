import { createApiClient } from '@/lib/http/api-client';
import { CannedServer } from '@/testing/canned-server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getUploadErrorMessage,
  UPLOAD_ERROR_COPY,
} from './get-upload-error-message';
import {
  createDocumentsRequests,
  type DocumentsRequests,
} from './query/documents-requests';

const NOTES = new File(['notes'], 'notes.txt', { type: 'text/plain' });

describe('explaining why an upload failed', () => {
  let server: CannedServer;
  let requests: DocumentsRequests;

  beforeEach(async () => {
    server = new CannedServer();
    requests = createDocumentsRequests(createApiClient(await server.start()));
  });

  afterEach(async () => {
    await server.stop().catch(() => undefined);
  });

  const failureOfUpload = () =>
    requests.uploadDocument(NOTES).catch((reason: unknown) => reason);

  it('shows the API own reason for a file it refuses', async () => {
    server.respondTo('POST', '/documents', 400, {
      statusCode: 400,
      message: 'The file is empty',
      error: 'Bad Request',
    });

    expect(getUploadErrorMessage(await failureOfUpload())).toBe(
      'The file is empty',
    );
  });

  it('says the file is too large when the API finds it too large', async () => {
    server.respondTo('POST', '/documents', 413, {
      statusCode: 413,
      message: 'File too large',
      error: 'Payload Too Large',
    });

    expect(getUploadErrorMessage(await failureOfUpload())).toBe(
      UPLOAD_ERROR_COPY.tooLarge,
    );
  });

  it('asks to try again when the server fails', async () => {
    server.respondTo('POST', '/documents', 500, {
      statusCode: 500,
      message: 'Internal Server Error',
    });

    expect(getUploadErrorMessage(await failureOfUpload())).toBe(
      UPLOAD_ERROR_COPY.generic,
    );
  });

  it('asks to try again when the server cannot be reached', async () => {
    await server.stop();

    expect(getUploadErrorMessage(await failureOfUpload())).toBe(
      UPLOAD_ERROR_COPY.generic,
    );
  });
});
