import { z } from 'zod';

const DEFAULT_CONTAINER_NAME = 'documents';
const DEFAULT_MAX_UPLOAD_BYTES = 1_048_576;
const DEFAULT_CHUNK_SIZE = 1_500;
const DEFAULT_CHUNK_OVERLAP = 200;
const DEFAULT_CHUNK_MIN_SIZE = 200;
const AZURE_CONTAINER_NAME_PATTERN =
  /^(?!.*--)[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

const positiveInteger = (fallback: number) =>
  z.coerce.number().int().positive().default(fallback);

const nonNegativeInteger = (fallback: number) =>
  z.coerce.number().int().nonnegative().default(fallback);

const documentsEnvSchema = z
  .object({
    AZURE_STORAGE_CONTAINER_NAME: z
      .string()
      .regex(AZURE_CONTAINER_NAME_PATTERN, {
        error:
          'AZURE_STORAGE_CONTAINER_NAME must be 3-63 lowercase letters, digits or single hyphens',
      })
      .default(DEFAULT_CONTAINER_NAME),
    DOCUMENTS_MAX_UPLOAD_BYTES: positiveInteger(DEFAULT_MAX_UPLOAD_BYTES),
    DOCUMENTS_CHUNK_SIZE: positiveInteger(DEFAULT_CHUNK_SIZE),
    DOCUMENTS_CHUNK_OVERLAP: nonNegativeInteger(DEFAULT_CHUNK_OVERLAP),
    DOCUMENTS_CHUNK_MIN_SIZE: nonNegativeInteger(DEFAULT_CHUNK_MIN_SIZE),
  })
  .refine((env) => env.DOCUMENTS_CHUNK_OVERLAP < env.DOCUMENTS_CHUNK_SIZE, {
    error: 'DOCUMENTS_CHUNK_OVERLAP must be smaller than DOCUMENTS_CHUNK_SIZE',
    path: ['DOCUMENTS_CHUNK_OVERLAP'],
  })
  .refine((env) => env.DOCUMENTS_CHUNK_MIN_SIZE < env.DOCUMENTS_CHUNK_SIZE, {
    error: 'DOCUMENTS_CHUNK_MIN_SIZE must be smaller than DOCUMENTS_CHUNK_SIZE',
    path: ['DOCUMENTS_CHUNK_MIN_SIZE'],
  });

type DocumentsEnv = z.infer<typeof documentsEnvSchema>;

export interface ChunkingSettings {
  size: number;
  overlap: number;
  minSize: number;
}

export class DocumentsConfig {
  readonly containerName: string;
  readonly maxUploadBytes: number;
  readonly chunking: ChunkingSettings;

  private constructor(env: DocumentsEnv) {
    this.containerName = env.AZURE_STORAGE_CONTAINER_NAME;
    this.maxUploadBytes = env.DOCUMENTS_MAX_UPLOAD_BYTES;
    this.chunking = {
      size: env.DOCUMENTS_CHUNK_SIZE,
      overlap: env.DOCUMENTS_CHUNK_OVERLAP,
      minSize: env.DOCUMENTS_CHUNK_MIN_SIZE,
    };
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
