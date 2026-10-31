import { BlobServiceClient } from '@azure/storage-blob';
import { Global, Module } from '@nestjs/common';
import { AzureStorageConfig } from './azure-storage.config';

@Global()
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
  ],
  exports: [BlobServiceClient],
})
export class AzureStorageModule {}
