import { Module } from '@nestjs/common';
import { TemporalWorkerRunner } from './temporal-worker.runner';
import { TemporalConfig } from './temporal.config';

@Module({
  providers: [
    {
      provide: TemporalConfig,
      useFactory: () => TemporalConfig.fromEnv(process.env),
    },
    TemporalWorkerRunner,
  ],
  exports: [TemporalWorkerRunner],
})
export class WorkflowEngineWorkerModule {}
