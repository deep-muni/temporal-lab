import type { DocumentStatus } from './document-status';

export interface Document {
  id: string;
  name: string;
  blobName: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewDocument {
  id: string;
  name: string;
  blobName: string;
}
