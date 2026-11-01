import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { EMBEDDING_DIMENSIONS } from '@src/documents/domain/models/document-chunk';
import { EMBEDDING_MODEL_PORT } from '@src/embedding/domain/ports/embedding-model.port';
import { InMemoryEmbeddingModelAdapter } from '@src/embedding/testing/in-memory-embedding-model.adapter';
import { FILE_STORE_PORT } from '@src/file-storage/domain/ports/file-store.port';
import { InMemoryFileStoreAdapter } from '@src/file-storage/testing/in-memory-file-store.adapter';
import { PrismaService } from '@src/lib/database/prisma.service';

export interface E2eApp {
  app: INestApplication;
  prisma: PrismaService;
}

export const createE2eApp = async (): Promise<E2eApp> => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(FILE_STORE_PORT)
    .useValue(new InMemoryFileStoreAdapter())
    .overrideProvider(EMBEDDING_MODEL_PORT)
    .useValue(new InMemoryEmbeddingModelAdapter(EMBEDDING_DIMENSIONS))
    .compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return { app, prisma: app.get(PrismaService) };
};
