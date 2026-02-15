import { Module } from '@nestjs/common';
import { SQSConsumerService } from './sqs-consumer.service';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [EvaluationModule],
  providers: [SQSConsumerService],
  exports: [SQSConsumerService],
})
export class SQSModule {}
