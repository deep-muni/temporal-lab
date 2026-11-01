import type { DocumentStatus, DocumentSummary } from './document.schema';
import { isBeingRead } from './is-being-read';

export interface DocumentsSummary {
  total: number;
  processing: number;
  ready: number;
  failed: number;
}

type Stage = Exclude<keyof DocumentsSummary, 'total'>;

const STAGE_OF: Record<DocumentStatus, Stage> = {
  uploaded: 'processing',
  processing: 'processing',
  ready: 'ready',
  failed: 'failed',
};

export function summarizeDocuments(
  documents: DocumentSummary[],
): DocumentsSummary {
  return documents.reduce<DocumentsSummary>(
    (summary, document) => ({
      ...summary,
      [STAGE_OF[document.status]]: summary[STAGE_OF[document.status]] + 1,
    }),
    { total: documents.length, processing: 0, ready: 0, failed: 0 },
  );
}

export function isAnyBeingRead(documents: DocumentSummary[]): boolean {
  return documents.some((document) => isBeingRead(document.status));
}
