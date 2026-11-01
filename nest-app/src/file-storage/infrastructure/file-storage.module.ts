import { BlobServiceClient } from '@azure/storage-blob';
import { Module } from '@nestjs/common';
import { AzureBlobFileStoreAdapter } from '@src/file-storage/adapters/driven/azure-blob/azure-blob-file-store.adapter';
import { FileStorageService } from '@src/file-storage/application/file-storage.service';
import { FILE_STORE_PORT } from '@src/file-storage/domain/ports/file-store.port';
import { AzureStorageConfig } from './azure-storage.config';

@Module({
  providers: [
    {
      provide: AzureStorageConfig,
      useFactory: () => AzureStorageConfig.fromEnv(process.env),
    },
    {
      provide: BlobServiceClient,
      inject: [AzureStorageConfig],
      useFactory: (config: AzureStorageConfig) =>
        BlobServiceClient.fromConnectionString(config.connectionString, {
          retryOptions: {
            maxTries: config.maxTries,
            tryTimeoutInMs: config.requestTimeoutMs,
          },
        }),
    },
    { provide: FILE_STORE_PORT, useClass: AzureBlobFileStoreAdapter },
    FileStorageService,
  ],
  exports: [FileStorageService],
})
export class FileStorageModule {}
