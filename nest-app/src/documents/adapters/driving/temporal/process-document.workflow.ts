import { ActivityFailure, proxyActivities } from '@temporalio/workflow';
import type { DocumentProcessingActivities } from './document-processing.activities';

const quickStep = proxyActivities<DocumentProcessingActivities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '30 seconds',
    maximumAttempts: 5,
  },
});

const embedding = proxyActivities<DocumentProcessingActivities>({
  startToCloseTimeout: '30 minutes',
  heartbeatTimeout: '2 minutes',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '1 minute',
    maximumAttempts: 10,
  },
});

export async function processDocument(documentId: string): Promise<void> {
  if (!(await quickStep.startProcessing(documentId))) {
    return;
  }
  try {
    await quickStep.splitIntoChunks(documentId);
    await embedding.embedChunks(documentId);
    await quickStep.markReady(documentId);
  } catch (error) {
    await quickStep.markFailed(documentId, failureReason(error));
    throw error;
  }
}

function failureReason(error: unknown): string {
  if (error instanceof ActivityFailure && error.cause) {
    return error.cause.message;
  }
  return error instanceof Error ? error.message : String(error);
}
