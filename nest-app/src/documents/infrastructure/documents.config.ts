import { z } from 'zod';

const DEFAULT_CONTAINER_NAME = 'documents';
const DEFAULT_MAX_UPLOAD_BYTES = 1_048_576;
const AZURE_CONTAINER_NAME_PATTERN =
  /^(?!.*--)[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

const documentsEnvSchema = z.object({
  AZURE_STORAGE_CONTAINER_NAME: z
    .string()
    .regex(AZURE_CONTAINER_NAME_PATTERN, {
      error:
        'AZURE_STORAGE_CONTAINER_NAME must be 3-63 lowercase letters, digits or single hyphens',
    })
    .default(DEFAULT_CONTAINER_NAME),
  DOCUMENTS_MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_MAX_UPLOAD_BYTES),
});

type DocumentsEnv = z.infer<typeof documentsEnvSchema>;

export class DocumentsConfig {
  readonly containerName: string;
  readonly maxUploadBytes: number;

  private constructor(env: DocumentsEnv) {
    this.containerName = env.AZURE_STORAGE_CONTAINER_NAME;
    this.maxUploadBytes = env.DOCUMENTS_MAX_UPLOAD_BYTES;
  }

  static fromEnv(env: NodeJS.ProcessEnv): DocumentsConfig {
    return new DocumentsConfig(parseDocumentsEnv(env));
  }
}

function parseDocumentsEnv(env: NodeJS.ProcessEnv): DocumentsEnv {
  const result = documentsEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid documents configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
