import { Module } from '@nestjs/common';
import { DocumentsModule } from './documents/infrastructure/documents.module.js';
import { AzureStorageModule } from './lib/azure-storage/azure-storage.module.js';
import { DatabaseModule } from './lib/database/database.module.js';

@Module({
  imports: [DatabaseModule, AzureStorageModule, DocumentsModule],
})
export class AppModule {}
