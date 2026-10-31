import { Module } from '@nestjs/common';
import { DocumentsModule } from './documents/infrastructure/documents.module';
import { AzureStorageModule } from './lib/azure-storage/azure-storage.module';
import { DatabaseModule } from './lib/database/database.module';

@Module({
  imports: [DatabaseModule, AzureStorageModule, DocumentsModule],
})
export class AppModule {}
