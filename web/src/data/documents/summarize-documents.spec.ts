import { describe, expect, it } from 'vitest';
import type { DocumentStatus, DocumentSummary } from './document.schema';
import { summarizeDocuments } from './summarize-documents';

const documentWith = (status: DocumentStatus): DocumentSummary => ({
  id: crypto.randomUUID(),
  name: `${status}.md`,
  status,
  uploadedAt: '2026-11-01T10:00:00.000Z',
});

describe('summarizing the library', () => {
  it('counts nothing in an empty library', () => {
    expect(summarizeDocuments([])).toEqual({
      total: 0,
      processing: 0,
      ready: 0,
      failed: 0,
    });
  });

  it('counts just-uploaded and processing documents together as processing', () => {
    expect(
      summarizeDocuments([
        documentWith('uploaded'),
        documentWith('processing'),
        documentWith('ready'),
        documentWith('ready'),
        documentWith('failed'),
      ]),
    ).toEqual({ total: 5, processing: 2, ready: 2, failed: 1 });
  });
});
