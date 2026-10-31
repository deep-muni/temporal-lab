import { BlobServiceClient } from '@azure/storage-blob';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaDocumentRepository } from '@src/documents/adapters/driven/persistence/prisma/document.repository';
import { AzureBlobDocumentFileStoreAdapter } from '@src/documents/adapters/driven/storage/azure-blob-document-file-store.adapter';
import { DocumentsController } from '@src/documents/adapters/driving/http/documents.controller';
import { DocumentService } from '@src/documents/application/document.service';
import { DOCUMENT_FILE_STORE_PORT } from '@src/documents/domain/ports/document-file-store.port';
import { DOCUMENT_REPOSITORY_PORT } from '@src/documents/domain/ports/document-repository.port';
import { DocumentsConfig } from './documents.config';
import { DocumentsConfigModule } from './documents-config.module';

@Module({
  imports: [
    DocumentsConfigModule,
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
    { provide: DOCUMENT_REPOSITORY_PORT, useClass: PrismaDocumentRepository },
    {
      provide: DOCUMENT_FILE_STORE_PORT,
      inject: [BlobServiceClient, DocumentsConfig],
      useFactory: (blobService: BlobServiceClient, config: DocumentsConfig) =>
        new AzureBlobDocumentFileStoreAdapter(
          blobService.getContainerClient(config.containerName),
        ),
    },
  ],
})
export class DocumentsModule {}
