import type { Document } from '@src/documents/domain/models/document';
import type { DocumentStatus } from '@src/documents/domain/models/document-status';

export interface DocumentResponseDto {
  id: string;
  name: string;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface DocumentListResponseDto {
  documents: DocumentResponseDto[];
}

export function toDocumentListResponse(
  documents: Document[],
): DocumentListResponseDto {
  return { documents: documents.map(toDocumentResponse) };
}

export function toDocumentResponse(document: Document): DocumentResponseDto {
  return {
    id: document.id,
    name: document.name,
    status: document.status,
    uploadedAt: document.createdAt.toISOString(),
  };
}
