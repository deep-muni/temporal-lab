import { Inject, Injectable } from '@nestjs/common';
import type {
  TextFormat,
  TextSplitOptions,
} from '@src/text-splitting/domain/models/text-format';
import {
  TEXT_SPLITTER_PORT,
  type TextSplitterPort,
} from '@src/text-splitting/domain/ports/text-splitter.port';

const PIECE_SEPARATOR = '\n\n';

@Injectable()
export class TextSplittingService {
  constructor(
    @Inject(TEXT_SPLITTER_PORT) private readonly splitter: TextSplitterPort,
  ) {}

  async split(
    text: string,
    format: TextFormat,
    { minSize, ...options }: TextSplitOptions,
  ): Promise<string[]> {
    const pieces = await this.splitter.split(text, format, options);
    return mergeShortPieces(pieces, minSize);
  }
}

function mergeShortPieces(pieces: string[], minSize: number): string[] {
  const merged = pieces.reduce<string[]>((result, piece) => {
    const previous = result.at(-1);
    if (previous !== undefined && previous.length < minSize) {
      result[result.length - 1] = previous + PIECE_SEPARATOR + piece;
    } else {
      result.push(piece);
    }
    return result;
  }, []);
  return mergeShortTail(merged, minSize);
}

function mergeShortTail(pieces: string[], minSize: number): string[] {
  const tail = pieces.at(-1);
  if (pieces.length < 2 || tail === undefined || tail.length >= minSize) {
    return pieces;
  }
  const beforeTail = pieces[pieces.length - 2];
  return [...pieces.slice(0, -2), beforeTail + PIECE_SEPARATOR + tail];
}
