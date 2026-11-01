import { LangChainTextSplitterAdapter } from '@src/text-splitting/adapters/driven/langchain/langchain-text-splitter.adapter';
import { TextFormat } from '@src/text-splitting/domain/models/text-format';
import { TextSplittingService } from './text-splitting.service';

const OPTIONS = { size: 100, overlap: 0, minSize: 40 };
const NOTE = 'Temporal keeps work durable.';
const MARKDOWN_GUIDE = [
  '# Durable work',
  'Temporal records every step of a workflow in its event history.',
  '## Retries',
  'A failed activity is retried with exponential backoff until it succeeds or runs out of attempts.',
].join('\n\n');
const PARAGRAPHS = [
  'Temporal records every workflow step in an event history.',
  'Activities are retried with backoff when they fail.',
  'Workers can crash and the workflow still resumes later.',
];

// LangChain splitting runs in memory, so these service specs use the real adapter.
function setUp() {
  return new TextSplittingService(new LangChainTextSplitterAdapter());
}

describe('splitting text into pieces', () => {
  it('keeps a short text whole', async () => {
    const splitting = setUp();

    await expect(
      splitting.split(NOTE, TextFormat.Plain, OPTIONS),
    ).resolves.toEqual([NOTE]);
  });

  it('splits plain text at paragraphs once it outgrows the piece size', async () => {
    const splitting = setUp();

    const pieces = await splitting.split(
      PARAGRAPHS.join('\n\n'),
      TextFormat.Plain,
      OPTIONS,
    );

    expect(pieces).toEqual(PARAGRAPHS);
  });

  it('splits markdown at its headings and keeps each heading with its section', async () => {
    const splitting = setUp();

    const pieces = await splitting.split(
      MARKDOWN_GUIDE,
      TextFormat.Markdown,
      OPTIONS,
    );

    expect(pieces).toEqual([
      '# Durable work\n\nTemporal records every step of a workflow in its event history.',
      '## Retries\n\nA failed activity is retried with exponential backoff until it succeeds or runs out of attempts.',
    ]);
  });

  it('joins a short last piece onto the one before it', async () => {
    const splitting = setUp();
    const text = `${PARAGRAPHS[0]}\n\n${PARAGRAPHS[1]}\n\nThe end.`;

    const pieces = await splitting.split(text, TextFormat.Plain, OPTIONS);

    expect(pieces).toEqual([PARAGRAPHS[0], `${PARAGRAPHS[1]}\n\nThe end.`]);
  });
});
