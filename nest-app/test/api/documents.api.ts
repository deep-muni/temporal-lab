import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import type {
  DocumentListResponseDto,
  DocumentResponseDto,
} from '@src/documents/adapters/driving/http/dto/document-response.dto';
import { UPLOAD_FIELD_NAME } from '@src/documents/adapters/driving/http/documents.controller';
import request from 'supertest';

export const documentsApi = (app: INestApplication) => {
  const server = app.getHttpServer() as Server;
  return {
    upload: async (fileName: string, content: string | Buffer) => {
      const response = await request(server)
        .post('/documents')
        .attach(UPLOAD_FIELD_NAME, Buffer.from(content), fileName);
      return {
        status: response.status,
        body: response.body as DocumentResponseDto,
      };
    },

    list: async () => {
      const response = await request(server).get('/documents');
      return {
        status: response.status,
        body: response.body as DocumentListResponseDto,
      };
    },

    delete: async (documentId: string) => {
      const response = await request(server).delete(`/documents/${documentId}`);
      return { status: response.status, body: response.body as unknown };
    },
  };
};
