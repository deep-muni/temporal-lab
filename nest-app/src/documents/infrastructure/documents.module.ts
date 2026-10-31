import { BlobServiceClient } from '@azure/storage-blob';
import { Module } from '@nestjs/common';
import { AzureBlobDocumentFileStoreAdapter } from '../adapters/driven/storage/azure-blob-document-file-store.adapter.js';
import { DOCUMENT_FILE_STORE } from '../domain/ports/document-file-store.port.js';
import { DocumentsConfig } from './documents.config.js';

@Module({
  providers: [
    {
      provide: DocumentsConfig,
      useFactory: () => DocumentsConfig.fromEnv(process.env),
    },
    {
      provide: DOCUMENT_FILE_STORE,
      inject: [BlobServiceClient, DocumentsConfig],
      useFactory: (blobService: BlobServiceClient, config: DocumentsConfig) =>
        new AzureBlobDocumentFileStoreAdapter(
          blobService.getContainerClient(config.containerName),
        ),
    },
  ],
})
export class DocumentsModule {}
