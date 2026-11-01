import type { DocumentStatus } from '@/data/documents/document.schema';

export interface StatusView {
  label: string;
  colorPalette: string;
}

export const STATUS_VIEW: Record<DocumentStatus, StatusView> = {
  uploaded: { label: 'Processing', colorPalette: 'blue' },
  processing: { label: 'Processing', colorPalette: 'blue' },
  ready: { label: 'Ready', colorPalette: 'green' },
  failed: { label: 'Failed', colorPalette: 'red' },
};

export const DOCUMENTS_COPY = {
  title: 'Documents',
  description:
    'Upload a text or markdown file. Each one is read in the background.',
  upload: 'Upload document',
  columns: { name: 'File', uploadedAt: 'Uploaded', status: 'Status' },
  loading: 'Loading documents',
  empty: {
    title: 'No documents yet',
    description: 'Upload a .txt or .md file to get started.',
  },
  error: {
    title: 'Could not load documents',
    description: 'The documents service did not answer. Try again in a moment.',
  },
  retry: 'Try again',
} as const;
