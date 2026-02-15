import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
  Message,
} from '@aws-sdk/client-sqs';

export interface EvaluationJob {
  snapshotId: string;
  s3Path: string;
  projectId: string;
}

@Injectable()
export class SQSConsumerService implements OnModuleInit {
  private readonly logger = new Logger(SQSConsumerService.name);
  private sqsClient: SQSClient;
  private queueUrl: string;
  private isRunning = false;
  private concurrency: number;
  private pollInterval: number;
  private visibilityTimeout: number;
  private activeJobs = 0;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get('aws');
    this.sqsClient = new SQSClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
    this.queueUrl = awsConfig.sqs.queueUrl;
    
    const workerConfig = this.configService.get('worker');
    this.concurrency = workerConfig.concurrency;
    this.pollInterval = workerConfig.pollInterval;
    this.visibilityTimeout = workerConfig.visibilityTimeout;
  }

  onModuleInit() {
    this.logger.log('SQS Consumer initializing...');
    this.startPolling();
  }

  private async startPolling() {
    this.isRunning = true;
    this.logger.log(`Starting SQS polling with concurrency: ${this.concurrency}`);
    
    while (this.isRunning) {
      try {
        if (this.activeJobs < this.concurrency) {
          await this.pollMessages();
        }
        await this.sleep(this.pollInterval * 1000);
      } catch (error) {
        this.logger.error(`Error in polling loop: ${error.message}`, error.stack);
        await this.sleep(5000); // Wait before retrying
      }
    }
  }

  private async pollMessages() {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: Math.min(10, this.concurrency - this.activeJobs),
      WaitTimeSeconds: this.pollInterval,
      VisibilityTimeout: this.visibilityTimeout,
    });

    try {
      const response = await this.sqsClient.send(command);
      
      if (response.Messages && response.Messages.length > 0) {
        this.logger.log(`Received ${response.Messages.length} messages from SQS`);
        
        for (const message of response.Messages) {
          this.processMessage(message);
        }
      }
    } catch (error) {
      this.logger.error(`Error receiving messages: ${error.message}`, error.stack);
    }
  }

  private async processMessage(message: Message) {
    this.activeJobs++;
    
    try {
      if (!message.Body || !message.ReceiptHandle) {
        throw new Error('Invalid message: missing body or receipt handle');
      }
      
      const job: EvaluationJob = JSON.parse(message.Body);
      this.logger.log(`Processing evaluation job for snapshot: ${job.snapshotId}`);
      
      // Process the job (will be handled by EvaluationOrchestrator)
      await this.handleJob(job);
      
      // Delete message after successful processing
      await this.deleteMessage(message.ReceiptHandle);
      this.logger.log(`Successfully processed job: ${job.snapshotId}`);
      
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`, error.stack);
      
      // Extend visibility timeout to retry later
      if (message.ReceiptHandle) {
        await this.extendVisibility(message.ReceiptHandle, 60);
      }
    } finally {
      this.activeJobs--;
    }
  }

  private async deleteMessage(receiptHandle: string) {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });
    
    await this.sqsClient.send(command);
  }

  private async extendVisibility(receiptHandle: string, seconds: number) {
    const command = new ChangeMessageVisibilityCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: seconds,
    });
    
    await this.sqsClient.send(command);
  }

  private async handleJob(job: EvaluationJob) {
    // This will be implemented by injecting the EvaluationOrchestrator
    // For now, just log
    this.logger.log(`Job handler called for: ${JSON.stringify(job)}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stopPolling() {
    this.logger.log('Stopping SQS polling...');
    this.isRunning = false;
  }
}
