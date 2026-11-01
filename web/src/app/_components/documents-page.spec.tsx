import type { DocumentSummary } from '@/data/documents/document.schema';
import { DOCUMENTS_POLL_MS } from '@/data/documents/query/use-get-all-documents';
import { InMemoryDocumentsRequests } from '@/data/documents/testing/in-memory-documents-requests';
import { renderWithRequests } from '@/testing/render-with-requests';
import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentsPage } from './documents-page';

const NOW = new Date('2026-11-01T10:10:00.000Z');
const GUIDE: DocumentSummary = {
  id: '6a73b079-fad4-4a5b-b806-29c6d3e09f67',
  name: 'guide.md',
  status: 'processing',
  uploadedAt: '2026-11-01T10:05:00.000Z',
};
const NOTES: DocumentSummary = {
  id: '03c543e9-c281-4356-96d5-195248dfed4a',
  name: 'notes.txt',
  status: 'ready',
  uploadedAt: '2026-11-01T09:00:00.000Z',
};

const textsOf = (testId: string) =>
  screen.getAllByTestId(testId).map((element) => element.textContent);

describe('the documents page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invites the first upload when the library is empty', async () => {
    renderWithRequests(<DocumentsPage />, new InMemoryDocumentsRequests());

    expect(
      await screen.findByTestId('documents-empty-state'),
    ).toHaveTextContent('No documents yet');
    expect(
      screen.getByTestId('documents-empty-upload-button'),
    ).toHaveTextContent('Upload document');
  });

  it('lists documents newest first with their name, upload time and status', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(GUIDE, NOTES);

    renderWithRequests(<DocumentsPage />, requests);

    expect(await screen.findAllByTestId('documents-table-row')).toHaveLength(2);
    expect(textsOf('documents-table-name')).toEqual(['guide.md', 'notes.txt']);
    expect(textsOf('documents-table-uploaded-at')).toEqual([
      '5 minutes ago',
      'about 1 hour ago',
    ]);
    expect(textsOf('documents-table-status')).toEqual(['Processing', 'Ready']);
  });

  it('shows a document still being read turn ready on its own', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(GUIDE);
    renderWithRequests(<DocumentsPage />, requests);
    expect(
      await screen.findByTestId('documents-table-status'),
    ).toHaveTextContent('Processing');

    requests.setStatus(GUIDE.id, 'ready');

    await waitFor(
      () =>
        expect(screen.getByTestId('documents-table-status')).toHaveTextContent(
          'Ready',
        ),
      { timeout: DOCUMENTS_POLL_MS * 3 },
    );
  });

  it('says a document failed when it could not be read', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed({ ...GUIDE, status: 'failed' });

    renderWithRequests(<DocumentsPage />, requests);

    expect(
      await screen.findByTestId('documents-table-status'),
    ).toHaveTextContent('Failed');
  });

  it('offers a retry that recovers when the library fails to load', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(NOTES);
    requests.failNextListWith(new Error('documents service down'));
    const { user } = renderWithRequests(<DocumentsPage />, requests);
    expect(
      await screen.findByTestId('documents-error-state'),
    ).toHaveTextContent('Could not load documents');

    await user.click(screen.getByTestId('documents-retry-button'));

    expect(await screen.findByTestId('documents-table-name')).toHaveTextContent(
      'notes.txt',
    );
  });
});
