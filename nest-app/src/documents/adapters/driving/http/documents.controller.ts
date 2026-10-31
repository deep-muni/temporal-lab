import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from '@src/documents/application/document.service';
import type { IncomingDocumentFile } from '@src/documents/domain/models/document-upload';
import {
  toDocumentResponse,
  type DocumentResponseDto,
} from './dto/document-response.dto';
import { DocumentsHttpExceptionFilter } from './documents.http-exception.filter';

export const UPLOAD_FIELD_NAME = 'file';

@Controller('documents')
@UseFilters(DocumentsHttpExceptionFilter)
export class DocumentsController {
  constructor(
    @Inject(DocumentService) private readonly documents: DocumentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor(UPLOAD_FIELD_NAME))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<DocumentResponseDto> {
    const document = await this.documents.upload(toIncomingFile(file));
    return toDocumentResponse(document);
  }
}

function toIncomingFile(
  file: Express.Multer.File | undefined,
): IncomingDocumentFile | undefined {
  return file && { originalName: file.originalname, content: file.buffer };
}
