import { Module } from '@nestjs/common';
import { DocumentsModule } from './documents/infrastructure/documents.module';
import { DatabaseModule } from './lib/database/database.module';

@Module({
  imports: [DatabaseModule, DocumentsModule],
})
export class AppModule {}
