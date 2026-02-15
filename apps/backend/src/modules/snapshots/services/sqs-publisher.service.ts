import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export interface EvaluationJobMessage {
  snapshotId: string;
  s3Path: string;
  projectId: string;
  teamId: string;
  timestamp: Date;
}

@Injectable()
export class SQSPublisherService {
  private readonly logger = new Logger(SQSPublisherService.name);
  private sqsClient: SQSClient;
  private queueUrl: string;
  private maxRetries: number = 3;

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
  }

  async publishEvaluationJob(job: EvaluationJobMessage): Promise<void> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const command = new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify(job),
          MessageAttributes: {
            SnapshotId: {
              DataType: 'String',
              StringValue: job.snapshotId,
            },
            ProjectId: {
              DataType: 'String',
              StringValue: job.projectId,
            },
            TeamId: {
              DataType: 'String',
              StringValue: job.teamId,
            },
          },
        });

        const response = await this.sqsClient.send(command);
        
        this.logger.log(
          `Published evaluation job to SQS: ${job.snapshotId} (MessageId: ${response.MessageId})`
        );
        
        return;
        
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Failed to publish message (attempt ${attempt}/${this.maxRetries}): ${error.message}`
        );
        
        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await this.sleep(delay);
        }
      }
    }
    
    if (lastError) {
      this.logger.error(
        `Failed to publish evaluation job after ${this.maxRetries} attempts: ${lastError.message}`,
        lastError.stack
      );
      throw new Error(`Failed to publish evaluation job: ${lastError.message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
