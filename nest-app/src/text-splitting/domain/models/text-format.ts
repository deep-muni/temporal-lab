export const TextFormat = {
  Markdown: 'markdown',
  Plain: 'plain',
} as const;

export type TextFormat = (typeof TextFormat)[keyof typeof TextFormat];

export interface TextSplitOptions {
  size: number;
  overlap: number;
  minSize: number;
}
