export const DocumentStatus = {
  Uploaded: 'uploaded',
  Processing: 'processing',
  Ready: 'ready',
  Failed: 'failed',
} as const;

export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];
