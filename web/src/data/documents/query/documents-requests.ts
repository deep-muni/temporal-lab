import { httpGet } from '@/lib/http/http-get';
import { httpPostForm } from '@/lib/http/http-post-form';
import type { AxiosInstance } from 'axios';
import {
  documentListSchema,
  documentSummarySchema,
  type DocumentSummary,
} from '../document.schema';
import { documentsAPIRoute } from './api-routes';

export const UPLOAD_TIMEOUT_MS = 60_000;
export const UPLOAD_FIELD_NAME = 'file';

export interface DocumentsRequests {
  getAllDocuments(): Promise<DocumentSummary[]>;
  uploadDocument(file: File): Promise<DocumentSummary>;
  deleteDocument(id: string): Promise<void>;
}

export function createDocumentsRequests(
  client: AxiosInstance,
): DocumentsRequests {
  return {
    getAllDocuments: async () => {
      const { documents } = await httpGet(
        client,
        documentsAPIRoute,
        documentListSchema,
      );
      return documents;
    },
    uploadDocument: (file) => {
      const form = new FormData();
      form.append(UPLOAD_FIELD_NAME, file);
      return httpPostForm(
        client,
        documentsAPIRoute,
        form,
        documentSummarySchema,
        UPLOAD_TIMEOUT_MS,
      );
    },
    deleteDocument: async (id) => {
      await client.delete(`${documentsAPIRoute}/${encodeURIComponent(id)}`);
    },
  };
}
