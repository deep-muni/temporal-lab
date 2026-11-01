import { z } from 'zod';

export const DOCUMENT_STATUSES = [
  'uploaded',
  'processing',
  'ready',
  'failed',
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const documentSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: z.enum(DOCUMENT_STATUSES),
  uploadedAt: z.iso.datetime(),
});

export type DocumentSummary = z.infer<typeof documentSummarySchema>;

export const documentListSchema = z.object({
  documents: z.array(documentSummarySchema),
});

export const UPLOAD_ACCEPTED_EXTENSIONS = ['.txt', '.md'] as const;

export const UPLOAD_MAX_BYTES = 1_048_576;
