import { Module } from '@nestjs/common';
import { DocumentsModule } from './documents/infrastructure/documents.module';
import { DatabaseModule } from './lib/database/database.module';
import { WorkflowEngineWorkerModule } from './workflow-engine/infrastructure/workflow-engine-worker.module';

@Module({
  imports: [DatabaseModule, DocumentsModule, WorkflowEngineWorkerModule],
})
export class WorkerModule {}
