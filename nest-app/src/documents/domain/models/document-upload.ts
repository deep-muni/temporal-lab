import { InvalidDocumentUploadError } from '@src/documents/domain/errors/documents.errors';

export const FILE_NAME_MAX_LENGTH = 255;

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
};

const PATH_SEPARATOR = /[/\\]/;
const CONTROL_CHARACTERS = /\p{Cc}/gu;

export interface IncomingDocumentFile {
  originalName: string;
  content: Uint8Array;
}

export interface DocumentUpload {
  name: string;
  contentType: string;
  content: Uint8Array;
}

export function toDocumentUpload(
  file: IncomingDocumentFile | undefined,
): DocumentUpload {
  if (!file) {
    throw new InvalidDocumentUploadError('Choose a file to upload');
  }
  if (file.content.byteLength === 0) {
    throw new InvalidDocumentUploadError('The file is empty');
  }
  const name = toSafeFileName(file.originalName);
  return { name, contentType: contentTypeOf(name), content: file.content };
}

function toSafeFileName(originalName: string): string {
  const baseName = originalName.split(PATH_SEPARATOR).at(-1) ?? '';
  const name = baseName.replace(CONTROL_CHARACTERS, '').trim();
  if (name.length === 0 || name.length > FILE_NAME_MAX_LENGTH) {
    throw new InvalidDocumentUploadError(
      `The file name must be 1 to ${FILE_NAME_MAX_LENGTH} characters`,
    );
  }
  return name;
}

export function contentTypeOf(name: string): string {
  const contentType = CONTENT_TYPE_BY_EXTENSION[extensionOf(name)];
  if (!contentType) {
    throw new InvalidDocumentUploadError(
      'Only .txt and .md files can be uploaded',
    );
  }
  return contentType;
}

function extensionOf(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex <= 0 ? '' : name.slice(dotIndex).toLowerCase();
}
