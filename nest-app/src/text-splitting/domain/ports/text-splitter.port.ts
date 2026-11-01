import type {
  TextFormat,
  TextSplitOptions,
} from '@src/text-splitting/domain/models/text-format';

export const TEXT_SPLITTER_PORT = Symbol('TEXT_SPLITTER_PORT');

export type SplitterOptions = Omit<TextSplitOptions, 'minSize'>;

export interface TextSplitterPort {
  split(
    text: string,
    format: TextFormat,
    options: SplitterOptions,
  ): Promise<string[]>;
}
