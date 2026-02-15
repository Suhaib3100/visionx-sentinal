import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { EvaluationJob } from '../sqs/sqs-consumer.service';
import { LintAnalyzerService } from './analyzers/lint-analyzer.service';
import { ComplexityAnalyzerService } from './analyzers/complexity-analyzer.service';
import { SecurityScannerService } from './analyzers/security-scanner.service';
import { TestCoverageAnalyzerService } from './analyzers/test-coverage-analyzer.service';
import { LLMClientService } from '../ai/services/llm-client.service';
import { PromptBuilderService, CodeEvaluationContext } from '../ai/services/prompt-builder.service';
import * as tar from 'tar';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

// Import entities (will be copied from backend)
// import { Snapshot } from '../snapshots/entities/snapshot.entity';
// import { StaticMetrics } from './entities/static-metrics.entity';
// import { AIReport } from './entities/ai-report.entity';

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
    // @InjectRepository(AIReport)
    // private aiReportRepository: Repository<AIReport>,
    private readonly configService: ConfigService,
    private readonly lintAnalyzer: LintAnalyzerService,
    private readonly complexityAnalyzer: ComplexityAnalyzerService,
    private readonly securityScanner: SecurityScannerService,
    private readonly testCoverageAnalyzer: TestCoverageAnalyzerService,
    private readonly llmClient: LLMClientService,
    private readonly promptBuilder: PromptBuilderService,
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
    
    let workDir: string | null = null;
    
    try {
      // Step 1: Retrieve snapshot metadata from database
      // const snapshot = await this.snapshotRepository.findOne({
      //   where: { id: job.snapshotId },
      //   relations: ['project', 'team'],
      // });
      
      // if (!snapshot) {
      //   throw new Error(`Snapshot not found: ${job.snapshotId}`);
      // }
      
      // Mock snapshot data for now
      const snapshot = {
        id: job.snapshotId,
        project: { name: 'Test Project', description: 'A test hackathon project' },
        team: { name: 'Test Team' },
      };
      
      // Step 2: Download files from S3
      workDir = await this.downloadSnapshot(job.s3Path);
      
      // Step 3: Extract files
      const extractDir = await this.extractFiles(workDir);
      
      // Step 4: Read project files for AI analysis
      const files = await this.readProjectFiles(extractDir);
      
      // Step 5: Run static analysis
      this.logger.log('Running static analysis...');
      const lintScore = await this.lintAnalyzer.analyze(extractDir);
      const complexityScore = await this.complexityAnalyzer.analyze(extractDir);
      const securityScore = await this.securityScanner.scan(extractDir);
      const testScore = await this.testCoverageAnalyzer.analyze(extractDir);
      
      this.logger.log(`Static analysis complete:
        - Lint: ${lintScore}/100
        - Complexity: ${complexityScore}/100
        - Security: ${securityScore}/100
        - Test Coverage: ${testScore}/100
      `);
      
      // Step 6: Calculate aggregate static score
      const staticScore = this.calculateStaticScore({
        lintScore,
        complexityScore,
        securityScore,
        testScore,
      });
      
      // Step 7: Store static metrics in database
      // await this.metricsRepository.save({
      //   snapshot,
      //   lintScore,
      //   complexityScore,
      //   securityScore,
      //   testScore,
      //   staticScore,
      // });
      
      // Step 8: Run AI evaluation
      this.logger.log('Running AI evaluation with Bedrock...');
      const context: CodeEvaluationContext = {
        projectName: snapshot.project.name,
        teamName: snapshot.team.name,
        description: snapshot.project.description,
        files,
        staticMetrics: {
          lintScore,
          complexityScore,
          securityScore,
          testCoverageScore: testScore,
          totalFiles: files.length,
          totalLines: files.reduce((sum, f) => sum + f.content.split('\n').length, 0),
        },
      };
      
      const prompt = this.promptBuilder.buildEvaluationPrompt(context);
      const aiResponse = await this.llmClient.evaluateCode(prompt);
      
      this.logger.log(`AI evaluation complete:
        - Innovation: ${aiResponse.innovation_score}/100
        - Architecture: ${aiResponse.architecture_score}/100
        - Scalability: ${aiResponse.scalability_score}/100
        - Alignment: ${aiResponse.alignment_score}/100
        - Readability: ${aiResponse.readability_score}/100
        - Documentation: ${aiResponse.documentation_score}/100
        - Feedback: ${aiResponse.feedback}
        - Risk Flags: ${aiResponse.risk_flags.join(', ') || 'None'}
      `);
      
      // Step 9: Calculate aggregate AI score
      const aiScore = this.calculateAIScore(aiResponse);
      
      // Step 10: Store AI report in database
      // await this.aiReportRepository.save({
      //   snapshot,
      //   innovationScore: aiResponse.innovation_score,
      //   architectureScore: aiResponse.architecture_score,
      //   scalabilityScore: aiResponse.scalability_score,
      //   alignmentScore: aiResponse.alignment_score,
      //   readabilityScore: aiResponse.readability_score,
      //   documentationScore: aiResponse.documentation_score,
      //   feedback: aiResponse.feedback,
      //   riskFlags: aiResponse.risk_flags,
      //   aiScore,
      // });
      
      // Step 11: Calculate final score (60% static, 40% AI)
      const finalScore = staticScore * 0.6 + aiScore * 0.4;
      
      this.logger.log(`
        ========================================
        EVALUATION COMPLETE
        ========================================
        Snapshot ID: ${job.snapshotId}
        Static Score: ${staticScore.toFixed(2)}/100 (60% weight)
        AI Score: ${aiScore.toFixed(2)}/100 (40% weight)
        Final Score: ${finalScore.toFixed(2)}/100
        ========================================
      `);
      
      // Step 12: Cleanup
      await this.cleanup(workDir);
      
    } catch (error) {
      this.logger.error(`Evaluation failed: ${error.message}`, error.stack);
      
      // Cleanup on error
      if (workDir) {
        await this.cleanup(workDir).catch((cleanupError) => {
          this.logger.warn(`Cleanup failed: ${cleanupError.message}`);
        });
      }
      
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

  private async extractFiles(workDir: string): Promise<string> {
    this.logger.log('Extracting files...');
    
    const tarPath = path.join(workDir, 'snapshot.tar.gz');
    const extractDir = path.join(workDir, 'extracted');
    
    await fs.mkdir(extractDir, { recursive: true });
    
    await tar.extract({
      file: tarPath,
      cwd: extractDir,
    });
    
    return extractDir;
  }

  private async readProjectFiles(
    extractDir: string
  ): Promise<Array<{ path: string; content: string; size: number }>> {
    const files: Array<{ path: string; content: string; size: number }> = [];
    const maxFiles = 50; // Limit to prevent memory issues

    async function walkDir(dir: string, baseDir: string) {
      if (files.length >= maxFiles) return;

      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (files.length >= maxFiles) break;

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        // Skip common directories to ignore
        if (
          relativePath.includes('node_modules') ||
          relativePath.includes('.git') ||
          relativePath.includes('dist') ||
          relativePath.includes('build') ||
          relativePath.startsWith('.')
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await walkDir(fullPath, baseDir);
        } else if (entry.isFile()) {
          // Read text files only
          const ext = path.extname(entry.name).toLowerCase();
          const textExtensions = [
            '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
            '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala',
            '.html', '.css', '.scss', '.json', '.yaml', '.yml', '.md', '.txt',
          ];

          if (textExtensions.includes(ext)) {
            try {
              const stats = await fs.stat(fullPath);
              // Skip files larger than 1MB
              if (stats.size > 1024 * 1024) continue;

              const content = await fs.readFile(fullPath, 'utf-8');
              files.push({
                path: relativePath,
                content,
                size: stats.size,
              });
            } catch (error) {
              // Skip files that can't be read
              continue;
            }
          }
        }
      }
    }

    await walkDir(extractDir, extractDir);
    return files;
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

  private calculateAIScore(aiResponse: {
    innovation_score: number;
    architecture_score: number;
    scalability_score: number;
    alignment_score: number;
    readability_score: number;
    documentation_score: number;
  }): number {
    // Weighted average for AI metrics
    const weights = {
      innovation: 0.25,
      architecture: 0.20,
      scalability: 0.15,
      alignment: 0.20,
      readability: 0.10,
      documentation: 0.10,
    };

    return (
      aiResponse.innovation_score * weights.innovation +
      aiResponse.architecture_score * weights.architecture +
      aiResponse.scalability_score * weights.scalability +
      aiResponse.alignment_score * weights.alignment +
      aiResponse.readability_score * weights.readability +
      aiResponse.documentation_score * weights.documentation
    );
  }

  private async cleanup(workDir: string): Promise<void> {
    this.logger.log('Cleaning up temporary files...');
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
