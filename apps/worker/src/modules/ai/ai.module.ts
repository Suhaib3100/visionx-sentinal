import { Module } from '@nestjs/common';
import { LLMClientService } from './services/llm-client.service';
import { PromptBuilderService } from './services/prompt-builder.service';

@Module({
  providers: [LLMClientService, PromptBuilderService],
  exports: [LLMClientService, PromptBuilderService],
})
export class AIModule {}
