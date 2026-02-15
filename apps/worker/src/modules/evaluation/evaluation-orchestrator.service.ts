import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { EvaluationJob } from '../sqs/sqs-consumer.service';
import * as tar from 'tar';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

// Import entities (will be copied from backend)
// import { Snapshot } from '../snapshots/entities/snapshot.entity';
// import { StaticMetrics } from './entities/static-metrics.entity';

@Injectable()
export class EvaluationOrchestratorService {
  private readonly logger = new Logger(EvaluationOrchestratorService.name);
  private s3Client: S3Client;
  private s3Bucket: string;

  constructor(
    // @InjectRepository(Snapshot)
    // private snapshotRepository: Repository<Snapshot>,
    // @InjectRepository(StaticMetrics)
    // private metricsRepository: Repository<StaticMetrics>,
    private readonly configService: ConfigService,
  ) {
    const awsConfig = this.configService.get('aws');
    this.s3Client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
    this.s3Bucket = awsConfig.s3.bucket;
  }

  async processEvaluation(job: EvaluationJob): Promise<void> {
    this.logger.log(`Starting evaluation for snapshot: ${job.snapshotId}`);
    
    try {
      // Step 1: Retrieve snapshot metadata from database
      // const snapshot = await this.snapshotRepository.findOne({
      //   where: { id: job.snapshotId },
      //   relations: ['project', 'team'],
      // });
      
      // if (!snapshot) {
      //   throw new Error(`Snapshot not found: ${job.snapshotId}`);
      // }
      
      // Step 2: Download files from S3
      const workDir = await this.downloadSnapshot(job.s3Path);
      
      // Step 3: Extract files
      await this.extractFiles(workDir);
      
      // Step 4: Run static analysis
      // const lintScore = await this.lintAnalyzer.analyze(workDir);
      // const complexityScore = await this.complexityAnalyzer.analyze(workDir);
      // const securityScore = await this.securityScanner.scan(workDir);
      // const testScore = await this.testCoverageAnalyzer.analyze(workDir);
      
      // Step 5: Calculate aggregate score
      // const staticScore = this.calculateStaticScore({
      //   lintScore,
      //   complexityScore,
      //   securityScore,
      //   testScore,
      // });
      
      // Step 6: Store metrics in database
      // await this.metricsRepository.save({
      //   snapshot,
      //   lintScore,
      //   complexityScore,
      //   securityScore,
      //   testScore,
      //   staticScore,
      // });
      
      // Step 7: Cleanup
      await this.cleanup(workDir);
      
      this.logger.log(`Evaluation completed for snapshot: ${job.snapshotId}`);
      
    } catch (error) {
      this.logger.error(`Evaluation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async downloadSnapshot(s3Path: string): Promise<string> {
    this.logger.log(`Downloading snapshot from S3: ${s3Path}`);
    
    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: s3Path,
    });
    
    const response = await this.s3Client.send(command);
    const workDir = path.join(os.tmpdir(), `visionx-${Date.now()}`);
    await fs.mkdir(workDir, { recursive: true });
    
    const tarPath = path.join(workDir, 'snapshot.tar.gz');
    const body = response.Body as NodeJS.ReadableStream;
    const writeStream = require('fs').createWriteStream(tarPath);
    
    await new Promise((resolve, reject) => {
      body.pipe(writeStream);
      body.on('end', resolve);
      body.on('error', reject);
    });
    
    return workDir;
  }

  private async extractFiles(workDir: string): Promise<void> {
    this.logger.log('Extracting files...');
    
    const tarPath = path.join(workDir, 'snapshot.tar.gz');
    const extractDir = path.join(workDir, 'extracted');
    
    await tar.extract({
      file: tarPath,
      cwd: extractDir,
    });
  }

  private calculateStaticScore(metrics: {
    lintScore: number;
    complexityScore: number;
    securityScore: number;
    testScore: number;
  }): number {
    // Weighted average based on SCORING_WEIGHTS
    const weights = {
      lint: 0.25,
      complexity: 0.20,
      security: 0.30,
      test: 0.25,
    };
    
    return (
      metrics.lintScore * weights.lint +
      metrics.complexityScore * weights.complexity +
      metrics.securityScore * weights.security +
      metrics.testScore * weights.test
    );
  }

  private async cleanup(workDir: string): Promise<void> {
    this.logger.log('Cleaning up temporary files...');
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
