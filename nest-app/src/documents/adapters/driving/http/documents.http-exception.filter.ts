import {
  BadRequestException,
  Catch,
  InternalServerErrorException,
  NotFoundException,
  type ArgumentsHost,
  type ExceptionFilter,
  type HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  DocumentFileNotFoundError,
  DocumentsDomainError,
  InvalidDocumentUploadError,
} from '@src/documents/domain/errors/documents.errors';

type DocumentsErrorType = abstract new (
  ...args: never[]
) => DocumentsDomainError;
type HttpExceptionFactory = (message: string) => HttpException;

const HTTP_EXCEPTION_BY_ERROR: ReadonlyArray<
  readonly [DocumentsErrorType, HttpExceptionFactory]
> = [
  [InvalidDocumentUploadError, (message) => new BadRequestException(message)],
  [DocumentFileNotFoundError, (message) => new NotFoundException(message)],
];

@Catch(DocumentsDomainError)
export class DocumentsHttpExceptionFilter implements ExceptionFilter {
  catch(error: DocumentsDomainError, host: ArgumentsHost): void {
    const exception = toHttpException(error);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.getStatus())
      .json(exception.getResponse());
  }
}

function toHttpException(error: DocumentsDomainError): HttpException {
  const match = HTTP_EXCEPTION_BY_ERROR.find(
    ([ErrorType]) => error instanceof ErrorType,
  );
  return match ? match[1](error.message) : new InternalServerErrorException();
}
