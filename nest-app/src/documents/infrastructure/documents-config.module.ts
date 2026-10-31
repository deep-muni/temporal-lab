import { Module } from '@nestjs/common';
import { DocumentsConfig } from './documents.config';

@Module({
  providers: [
    {
      provide: DocumentsConfig,
      useFactory: () => DocumentsConfig.fromEnv(process.env),
    },
  ],
  exports: [DocumentsConfig],
})
export class DocumentsConfigModule {}
