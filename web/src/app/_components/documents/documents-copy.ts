import type { DocumentStatus } from '@/data/documents/document.schema';
import type { IconType } from 'react-icons';
import { LuCircleCheck, LuCircleX, LuLoaderCircle } from 'react-icons/lu';

export interface StatusView {
  label: string;
  colorPalette: string;
  icon: IconType;
  isWorking: boolean;
}

const PROCESSING_VIEW: StatusView = {
  label: 'Processing',
  colorPalette: 'blue',
  icon: LuLoaderCircle,
  isWorking: true,
};

export const STATUS_VIEW: Record<DocumentStatus, StatusView> = {
  uploaded: PROCESSING_VIEW,
  processing: PROCESSING_VIEW,
  ready: {
    label: 'Ready',
    colorPalette: 'green',
    icon: LuCircleCheck,
    isWorking: false,
  },
  failed: {
    label: 'Failed',
    colorPalette: 'red',
    icon: LuCircleX,
    isWorking: false,
  },
};

export const DOCUMENTS_COPY = {
  title: 'Documents',
  description:
    'Upload text or markdown files. Each one is split, embedded and made ready to search in the background.',
  upload: 'Upload document',
  summary: {
    total: 'Total',
    processing: 'Processing',
    ready: 'Ready',
    failed: 'Failed',
  },
  library: {
    title: 'Library',
    live: 'Updating live',
  },
  columns: {
    name: 'File',
    uploadedAt: 'Uploaded',
    status: 'Status',
    actions: 'Actions',
  },
  fileTypes: { markdown: 'Markdown', plainText: 'Plain text' },
  loading: 'Loading documents',
  empty: {
    title: 'No documents yet',
    description:
      'Upload a .txt or .md file and it will show up here while it is read.',
  },
  error: {
    title: 'Could not load documents',
    description: 'The documents service did not answer. Try again in a moment.',
  },
  retry: 'Try again',
} as const;
