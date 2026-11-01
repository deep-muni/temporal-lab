import { Module } from '@nestjs/common';
import { LangChainTextSplitterAdapter } from '@src/text-splitting/adapters/driven/langchain/langchain-text-splitter.adapter';
import { TextSplittingService } from '@src/text-splitting/application/text-splitting.service';
import { TEXT_SPLITTER_PORT } from '@src/text-splitting/domain/ports/text-splitter.port';

@Module({
  providers: [
    { provide: TEXT_SPLITTER_PORT, useClass: LangChainTextSplitterAdapter },
    TextSplittingService,
  ],
  exports: [TextSplittingService],
})
export class TextSplittingModule {}
