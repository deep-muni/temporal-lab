import { Module } from '@nestjs/common';
import { WorkflowEngineWorkerModule } from './workflow-engine/infrastructure/workflow-engine-worker.module';

@Module({
  imports: [WorkflowEngineWorkerModule],
})
export class WorkerModule {}
