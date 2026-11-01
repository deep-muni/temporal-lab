import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TextSplittingChunkerAdapter } from '@src/documents/adapters/driven/chunking/text-splitting-chunker.adapter';
import { EmbeddingServiceAdapter } from '@src/documents/adapters/driven/embedding/embedding-service.adapter';
import { ClsTransactionalContextAdapter } from '@src/documents/adapters/driven/persistence/cls-transactional-context.adapter';
import { PrismaDocumentChunkRepository } from '@src/documents/adapters/driven/persistence/prisma/document-chunk.repository';
import { PrismaDocumentRepository } from '@src/documents/adapters/driven/persistence/prisma/document.repository';
import { InProcessDocumentProcessorAdapter } from '@src/documents/adapters/driven/processing/in-process-document-processor.adapter';
import { FileStorageDocumentFileStoreAdapter } from '@src/documents/adapters/driven/storage/file-storage-document-file-store.adapter';
import { DocumentsController } from '@src/documents/adapters/driving/http/documents.controller';
import { DocumentProcessingService } from '@src/documents/application/document-processing.service';
import { DocumentService } from '@src/documents/application/document.service';
import { DOCUMENT_CHUNK_REPOSITORY_PORT } from '@src/documents/domain/ports/document-chunk-repository.port';
import { DOCUMENT_FILE_STORE_PORT } from '@src/documents/domain/ports/document-file-store.port';
import { DOCUMENT_PROCESSOR_PORT } from '@src/documents/domain/ports/document-processor.port';
import { DOCUMENT_REPOSITORY_PORT } from '@src/documents/domain/ports/document-repository.port';
import { EMBEDDING_PORT } from '@src/documents/domain/ports/embedding.port';
import { TEXT_CHUNKER_PORT } from '@src/documents/domain/ports/text-chunker.port';
import { TRANSACTIONAL_CONTEXT_PORT } from '@src/documents/domain/ports/transactional-context.port';
import { EmbeddingModule } from '@src/embedding/infrastructure/embedding.module';
import { FileStorageModule } from '@src/file-storage/infrastructure/file-storage.module';
import { TextSplittingModule } from '@src/text-splitting/infrastructure/text-splitting.module';
import { DocumentsConfig } from './documents.config';
import { DocumentsConfigModule } from './documents-config.module';

@Module({
  imports: [
    DocumentsConfigModule,
    FileStorageModule,
    TextSplittingModule,
    EmbeddingModule,
    MulterModule.registerAsync({
      imports: [DocumentsConfigModule],
      inject: [DocumentsConfig],
      useFactory: (config: DocumentsConfig) => ({
        limits: { fileSize: config.maxUploadBytes, files: 1 },
      }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentService,
    DocumentProcessingService,
    {
      provide: DOCUMENT_PROCESSOR_PORT,
      useClass: InProcessDocumentProcessorAdapter,
    },
    { provide: DOCUMENT_REPOSITORY_PORT, useClass: PrismaDocumentRepository },
    {
      provide: DOCUMENT_CHUNK_REPOSITORY_PORT,
      useClass: PrismaDocumentChunkRepository,
    },
    {
      provide: TRANSACTIONAL_CONTEXT_PORT,
      useClass: ClsTransactionalContextAdapter,
    },
    {
      provide: DOCUMENT_FILE_STORE_PORT,
      useClass: FileStorageDocumentFileStoreAdapter,
    },
    { provide: TEXT_CHUNKER_PORT, useClass: TextSplittingChunkerAdapter },
    { provide: EMBEDDING_PORT, useClass: EmbeddingServiceAdapter },
  ],
})
export class DocumentsModule {}
