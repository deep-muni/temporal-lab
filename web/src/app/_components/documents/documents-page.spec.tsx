import type { DocumentSummary } from '@/data/documents/document.schema';
import { DOCUMENTS_POLL_MS } from '@/data/documents/query/use-get-all-documents';
import { InMemoryDocumentsRequests } from '@/data/documents/testing/in-memory-documents-requests';
import { nestJsError } from '@/data/documents/testing/nest-js-errors';
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

const GUIDE_FILE = new File(['# Durable work'], 'guide.md', {
  type: 'text/markdown',
});
const REPORT_FILE = new File(['%PDF-1.7'], 'report.pdf', {
  type: 'application/pdf',
});

async function openUploadDialog(requests: InMemoryDocumentsRequests) {
  const rendered = renderWithRequests(<DocumentsPage />, requests);
  await screen.findByTestId('documents-empty-state');
  await rendered.user.click(screen.getByTestId('documents-upload-button'));
  await screen.findByTestId('upload-document-dialog');
  return rendered;
}

const dialogClosed = () =>
  waitFor(() =>
    expect(
      screen.queryByTestId('upload-document-dialog'),
    ).not.toBeInTheDocument(),
  );

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

  it('summarizes the library at a glance', async () => {
    const requests = new InMemoryDocumentsRequests();
    requests.seed(GUIDE, NOTES, {
      ...NOTES,
      id: crypto.randomUUID(),
      status: 'failed',
    });

    renderWithRequests(<DocumentsPage />, requests);

    await waitFor(() =>
      expect(screen.getByTestId('documents-overview-total')).toHaveTextContent(
        '3',
      ),
    );
    expect(
      screen.getByTestId('documents-overview-processing'),
    ).toHaveTextContent('1');
    expect(screen.getByTestId('documents-overview-ready')).toHaveTextContent(
      '1',
    );
    expect(screen.getByTestId('documents-overview-failed')).toHaveTextContent(
      '1',
    );
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

  describe('uploading from the dialog', () => {
    it('closes the dialog and shows the new document at the top of the table as Processing', async () => {
      const requests = new InMemoryDocumentsRequests();
      const { user } = await openUploadDialog(requests);

      await user.upload(
        screen.getByTestId('upload-document-file-input'),
        GUIDE_FILE,
      );
      expect(
        screen.getByTestId('upload-document-selected-file'),
      ).toHaveTextContent('guide.md · 14 B');
      await user.click(screen.getByTestId('upload-document-submit-button'));

      await dialogClosed();
      expect(textsOf('documents-table-name')).toEqual(['guide.md']);
      expect(textsOf('documents-table-status')).toEqual(['Processing']);
    });

    it('cannot be closed while the file is being sent', async () => {
      const requests = new InMemoryDocumentsRequests();
      const sending = requests.holdNextUpload();
      const { user } = await openUploadDialog(requests);
      await user.upload(
        screen.getByTestId('upload-document-file-input'),
        GUIDE_FILE,
      );
      await user.click(screen.getByTestId('upload-document-submit-button'));
      screen.getByTestId('upload-document-dialog').focus();

      await user.keyboard('{Escape}');

      expect(screen.getByTestId('upload-document-dialog')).toHaveAttribute(
        'data-state',
        'open',
      );
      expect(
        screen.getByTestId('upload-document-cancel-button'),
      ).toBeDisabled();
      expect(screen.getByTestId('upload-document-close-button')).toBeDisabled();
      sending.complete();
      await dialogClosed();
    });

    it('explains why the API refused a file and keeps the dialog open', async () => {
      const requests = new InMemoryDocumentsRequests();
      requests.refuseNextUploadWith(nestJsError(400, 'The file is empty'));
      const { user } = await openUploadDialog(requests);
      await user.upload(
        screen.getByTestId('upload-document-file-input'),
        GUIDE_FILE,
      );

      await user.click(screen.getByTestId('upload-document-submit-button'));

      expect(
        await screen.findByTestId('upload-document-rejection-alert'),
      ).toHaveTextContent('The file is empty');
      expect(screen.getByTestId('upload-document-dialog')).toBeInTheDocument();
    });

    it('refuses a PDF before anything is sent', async () => {
      const requests = new InMemoryDocumentsRequests();
      const { user } = await openUploadDialog(requests);

      await user.upload(
        screen.getByTestId('upload-document-file-input'),
        REPORT_FILE,
      );

      expect(
        await screen.findByTestId('upload-document-rejection-alert'),
      ).toHaveTextContent(
        'Only .txt and .md files up to 1 MB can be uploaded.',
      );
      expect(
        screen.getByTestId('upload-document-submit-button'),
      ).toBeDisabled();
      expect(requests.uploadedFiles).toEqual([]);
    });

    it('closes on cancel and returns focus to the Upload button', async () => {
      const { user } = await openUploadDialog(new InMemoryDocumentsRequests());

      await user.click(screen.getByTestId('upload-document-cancel-button'));

      await dialogClosed();
      await waitFor(() =>
        expect(screen.getByTestId('documents-upload-button')).toHaveFocus(),
      );
    });
  });
});
