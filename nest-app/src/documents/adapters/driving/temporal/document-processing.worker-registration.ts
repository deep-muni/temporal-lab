import type { DocumentProcessingService } from '@src/documents/application/document-processing.service';
import type { WorkerRegistration } from '@src/workflow-engine/domain/models/worker-registration';
import { createDocumentProcessingActivities } from './document-processing.activities';

export const DOCUMENT_PROCESSING_TASK_QUEUE = 'document-processing';

export function documentProcessingWorkerRegistration(
  processing: DocumentProcessingService,
): WorkerRegistration {
  return {
    taskQueue: DOCUMENT_PROCESSING_TASK_QUEUE,
    workflowsPath: require.resolve('./process-document.workflow'),
    activities: createDocumentProcessingActivities(processing),
  };
}
