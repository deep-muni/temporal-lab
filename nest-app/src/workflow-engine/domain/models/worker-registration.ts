export type Activity = (...args: never[]) => Promise<unknown>;

export interface WorkerRegistration {
  taskQueue: string;
  workflowsPath: string;
  activities: Record<string, Activity>;
}
