import { Inject, Injectable } from '@nestjs/common';
import type { TextChunkerPort } from '@src/documents/domain/ports/text-chunker.port';
import { DocumentsConfig } from '@src/documents/infrastructure/documents.config';
import { TextSplittingService } from '@src/text-splitting/application/text-splitting.service';
import { TextFormat } from '@src/text-splitting/domain/models/text-format';

const TEXT_FORMAT_BY_CONTENT_TYPE: Record<string, TextFormat> = {
  'text/markdown': TextFormat.Markdown,
  'text/plain': TextFormat.Plain,
};

@Injectable()
export class TextSplittingChunkerAdapter implements TextChunkerPort {
  constructor(
    @Inject(TextSplittingService)
    private readonly splitting: TextSplittingService,
    @Inject(DocumentsConfig) private readonly config: DocumentsConfig,
  ) {}

  split(text: string, contentType: string): Promise<string[]> {
    return this.splitting.split(
      text,
      TEXT_FORMAT_BY_CONTENT_TYPE[contentType] ?? TextFormat.Plain,
      this.config.chunking,
    );
  }
}
