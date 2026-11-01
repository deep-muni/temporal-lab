import { NestFactory } from '@nestjs/core';
import { documentProcessingWorkerRegistration } from '@src/documents/adapters/driving/temporal/document-processing.worker-registration';
import { TemporalWorkerRunner } from '@src/workflow-engine/infrastructure/temporal-worker.runner';
import { WorkerModule } from '@src/worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  await app
    .get(TemporalWorkerRunner)
    .run([documentProcessingWorkerRegistration()]);
  await app.close();
}
void bootstrap();
