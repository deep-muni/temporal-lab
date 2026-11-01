import { Inject, Injectable, Logger } from '@nestjs/common';
import { NativeConnection, Worker } from '@temporalio/worker';
import type { WorkerRegistration } from '@src/workflow-engine/domain/models/worker-registration';
import { TemporalConfig } from './temporal.config';

@Injectable()
export class TemporalWorkerRunner {
  private readonly logger = new Logger(TemporalWorkerRunner.name);

  constructor(
    @Inject(TemporalConfig) private readonly config: TemporalConfig,
  ) {}

  async run(registrations: WorkerRegistration[]): Promise<void> {
    const connection = await NativeConnection.connect({
      address: this.config.address,
    });
    try {
      const workers = await Promise.all(
        registrations.map((registration) =>
          this.createWorker(connection, registration),
        ),
      );
      await Promise.all(workers.map((worker) => worker.run()));
    } finally {
      await connection.close();
    }
  }

  private async createWorker(
    connection: NativeConnection,
    registration: WorkerRegistration,
  ): Promise<Worker> {
    const worker = await Worker.create({
      connection,
      namespace: this.config.namespace,
      taskQueue: registration.taskQueue,
      workflowsPath: registration.workflowsPath,
      activities: registration.activities,
    });
    this.logger.log(`Polling task queue ${registration.taskQueue}`);
    return worker;
  }
}
