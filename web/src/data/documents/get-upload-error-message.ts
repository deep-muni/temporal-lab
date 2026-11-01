import { nestJsErrorOf } from '@/lib/http/nest-js-error';

const HTTP_BAD_REQUEST = 400;
const HTTP_PAYLOAD_TOO_LARGE = 413;

export const UPLOAD_ERROR_COPY = {
  tooLarge: 'That file is too large. Upload a file of 1 MB or less.',
  generic: 'The file could not be uploaded. Please try again.',
};

export function getUploadErrorMessage(error: unknown): string {
  const nestJsError = nestJsErrorOf(error);
  if (nestJsError?.status === HTTP_BAD_REQUEST) {
    return nestJsError.message;
  }
  if (nestJsError?.status === HTTP_PAYLOAD_TOO_LARGE) {
    return UPLOAD_ERROR_COPY.tooLarge;
  }
  return UPLOAD_ERROR_COPY.generic;
}
