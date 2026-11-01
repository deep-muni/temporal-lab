import { createTestWrapper } from '@/testing/render-with-requests';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DocumentSummary } from '../document.schema';
import { InMemoryDocumentsRequests } from '../testing/in-memory-documents-requests';
import { nestJsError } from '../testing/nest-js-errors';
import { useGetAllDocuments } from './use-get-all-documents';
import { useUploadDocument } from './use-upload-document';

const READY_NOTES: DocumentSummary = {
  id: '03c543e9-c281-4356-96d5-195248dfed4a',
  name: 'notes.txt',
  status: 'ready',
  uploadedAt: '2026-11-01T09:00:00.000Z',
};
const GUIDE = new File(['# Durable work'], 'guide.md', {
  type: 'text/markdown',
});

async function renderLoadedLibrary(requests: InMemoryDocumentsRequests) {
  const rendered = renderHook(
    () => ({ list: useGetAllDocuments(), upload: useUploadDocument() }),
    { wrapper: createTestWrapper(requests) },
  );
  await waitFor(() =>
    expect(rendered.result.current.list.isSuccess).toBe(true),
  );
  return rendered;
}

describe('uploading a document', () => {
  it('puts an accepted upload at the top of the list as being read before the list is fetched again', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(READY_NOTES);
    const { result } = await renderLoadedLibrary(requests);
    requests.failNextListWith(new Error('list unavailable'));

    await act(() => result.current.upload.mutateAsync(GUIDE));

    await waitFor(() =>
      expect(
        result.current.list.data?.map(({ name, status }) => ({ name, status })),
      ).toEqual([
        { name: 'guide.md', status: 'uploaded' },
        { name: 'notes.txt', status: 'ready' },
      ]),
    );
  });

  it('does not list an accepted upload twice once the list is fetched again', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(READY_NOTES);
    const { result } = await renderLoadedLibrary(requests);
    const callsBeforeUpload = requests.listCalls;

    await act(() => result.current.upload.mutateAsync(GUIDE));
    await waitFor(() =>
      expect(requests.listCalls).toBeGreaterThan(callsBeforeUpload),
    );

    await waitFor(() =>
      expect(result.current.list.data?.map(({ name }) => name)).toEqual([
        'guide.md',
        'notes.txt',
      ]),
    );
  });

  it('keeps the refusal so the screen can explain it', async () => {
    const requests = new InMemoryDocumentsRequests();
    const refusal = nestJsError(400, 'Only .txt and .md files can be uploaded');
    requests.refuseNextUploadWith(refusal);
    const { result } = await renderLoadedLibrary(requests);

    await act(() =>
      result.current.upload.mutateAsync(GUIDE).catch(() => undefined),
    );

    await waitFor(() => expect(result.current.upload.error).toBe(refusal));
    expect(result.current.list.data).toEqual([]);
  });
});
