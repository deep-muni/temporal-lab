import type { Document } from '@src/documents/domain/models/document';
import type { DocumentStatus } from '@src/documents/domain/models/document-status';

export interface DocumentResponseDto {
  id: string;
  name: string;
  status: DocumentStatus;
  uploadedAt: string;
}

export function toDocumentResponse(document: Document): DocumentResponseDto {
  return {
    id: document.id,
    name: document.name,
    status: document.status,
    uploadedAt: document.createdAt.toISOString(),
  };
}
