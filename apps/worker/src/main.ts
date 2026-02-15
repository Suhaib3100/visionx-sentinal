import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  const app = await NestFactory.create(AppModule);
  
  logger.log('🤖 VisionX Eval Worker Service starting...');
  logger.log('📊 Static Analysis Pipeline initialized');
  logger.log('📝 SQS Consumer active and polling for jobs');
  
  await app.init();
  
  // Worker doesn't listen on HTTP port, just processes SQS messages
  logger.log('✅ Worker service ready');
}

bootstrap();
