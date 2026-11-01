import {
  RecursiveCharacterTextSplitter,
  type TextSplitter,
} from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { TextFormat } from '@src/text-splitting/domain/models/text-format';
import type {
  SplitterOptions,
  TextSplitterPort,
} from '@src/text-splitting/domain/ports/text-splitter.port';

const CREATE_SPLITTER: Record<
  TextFormat,
  (options: SplitterOptions) => TextSplitter
> = {
  [TextFormat.Markdown]: ({ size, overlap }) =>
    RecursiveCharacterTextSplitter.fromLanguage('markdown', {
      chunkSize: size,
      chunkOverlap: overlap,
    }),
  [TextFormat.Plain]: ({ size, overlap }) =>
    new RecursiveCharacterTextSplitter({
      chunkSize: size,
      chunkOverlap: overlap,
    }),
};

@Injectable()
export class LangChainTextSplitterAdapter implements TextSplitterPort {
  split(
    text: string,
    format: TextFormat,
    options: SplitterOptions,
  ): Promise<string[]> {
    return CREATE_SPLITTER[format](options).splitText(text);
  }
}
