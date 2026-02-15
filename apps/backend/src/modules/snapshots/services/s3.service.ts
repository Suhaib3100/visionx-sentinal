import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get('aws');
    
    this.s3Client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });

    this.bucketName = awsConfig.s3.bucketName;
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const stream = response.Body;
    
    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    if (stream && typeof stream !== 'string') {
      for await (const chunk of stream as any) {
        chunks.push(chunk);
      }
    }
    
    return Buffer.concat(chunks);
  }

  generateKey(teamId: string, snapshotNumber: number): string {
    const timestamp = Date.now();
    return `snapshots/${teamId}/${snapshotNumber}-${timestamp}.zip`;
  }
}
