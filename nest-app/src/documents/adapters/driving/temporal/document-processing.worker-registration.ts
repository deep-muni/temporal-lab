import type { WorkerRegistration } from '@src/workflow-engine/domain/models/worker-registration';

export const DOCUMENT_PROCESSING_TASK_QUEUE = 'document-processing';

export function documentProcessingWorkerRegistration(): WorkerRegistration {
  return {
    taskQueue: DOCUMENT_PROCESSING_TASK_QUEUE,
    workflowsPath: require.resolve('./process-document.workflow'),
    activities: {},
  };
}
