import { Module } from '@nestjs/common';
import { SQSConsumerService } from './sqs-consumer.service';

@Module({
  providers: [SQSConsumerService],
  exports: [SQSConsumerService],
})
export class SQSModule {}
