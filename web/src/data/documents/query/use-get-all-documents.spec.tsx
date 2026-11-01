import { createTestWrapper } from '@/testing/render-with-requests';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DocumentSummary } from '../document.schema';
import { InMemoryDocumentsRequests } from '../testing/in-memory-documents-requests';
import { DOCUMENTS_POLL_MS, useGetAllDocuments } from './use-get-all-documents';

const GUIDE: DocumentSummary = {
  id: '6a73b079-fad4-4a5b-b806-29c6d3e09f67',
  name: 'guide.md',
  status: 'processing',
  uploadedAt: '2026-11-01T10:05:00.000Z',
};

const pause = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function renderDocuments(requests: InMemoryDocumentsRequests) {
  return renderHook(() => useGetAllDocuments(), {
    wrapper: createTestWrapper(requests),
  });
}

describe('keeping the document list up to date', () => {
  it('shows the documents the API returns', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(GUIDE);

    const { result } = renderDocuments(requests);

    await waitFor(() => expect(result.current.data).toEqual([GUIDE]));
  });

  it('keeps checking while a document is still being read and shows it ready once it is', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(GUIDE);
    const { result } = renderDocuments(requests);
    await waitFor(() => expect(result.current.data).toEqual([GUIDE]));

    requests.setStatus(GUIDE.id, 'ready');

    await waitFor(
      () =>
        expect(result.current.data).toEqual([{ ...GUIDE, status: 'ready' }]),
      { timeout: DOCUMENTS_POLL_MS * 3 },
    );
  });

  it('stops checking once every document has finished', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed({ ...GUIDE, status: 'ready' });
    const { result } = renderDocuments(requests);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const callsOnceLoaded = requests.listCalls;

    await pause(DOCUMENTS_POLL_MS * 1.5);

    expect(requests.listCalls).toBe(callsOnceLoaded);
  });
});
