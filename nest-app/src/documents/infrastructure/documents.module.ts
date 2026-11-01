import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaDocumentRepository } from '@src/documents/adapters/driven/persistence/prisma/document.repository';
import { InProcessDocumentProcessorAdapter } from '@src/documents/adapters/driven/processing/in-process-document-processor.adapter';
import { FileStorageDocumentFileStoreAdapter } from '@src/documents/adapters/driven/storage/file-storage-document-file-store.adapter';
import { DocumentsController } from '@src/documents/adapters/driving/http/documents.controller';
import { DocumentProcessingService } from '@src/documents/application/document-processing.service';
import { DocumentService } from '@src/documents/application/document.service';
import { DOCUMENT_FILE_STORE_PORT } from '@src/documents/domain/ports/document-file-store.port';
import { DOCUMENT_PROCESSOR_PORT } from '@src/documents/domain/ports/document-processor.port';
import { DOCUMENT_REPOSITORY_PORT } from '@src/documents/domain/ports/document-repository.port';
import { FileStorageModule } from '@src/file-storage/infrastructure/file-storage.module';
import { DocumentsConfig } from './documents.config';
import { DocumentsConfigModule } from './documents-config.module';

@Module({
  imports: [
    DocumentsConfigModule,
    FileStorageModule,
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
      provide: DOCUMENT_FILE_STORE_PORT,
      useClass: FileStorageDocumentFileStoreAdapter,
    },
  ],
})
export class DocumentsModule {}
