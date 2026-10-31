import type { Document } from '@src/documents/domain/models/document';
import type { Document as PrismaDocument } from '@src/generated/prisma/client';

export function toDocument(row: PrismaDocument): Document {
  return {
    id: row.id,
    name: row.name,
    blobName: row.blobName,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
