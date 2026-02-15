import { Module } from '@nestjs/common';
import { EvaluationOrchestratorService } from './evaluation-orchestrator.service';
import { LintAnalyzerService } from './analyzers/lint-analyzer.service';
import { ComplexityAnalyzerService } from './analyzers/complexity-analyzer.service';
import { SecurityScannerService } from './analyzers/security-scanner.service';
import { TestCoverageAnalyzerService } from './analyzers/test-coverage-analyzer.service';

@Module({
  providers: [
    EvaluationOrchestratorService,
    LintAnalyzerService,
    ComplexityAnalyzerService,
    SecurityScannerService,
    TestCoverageAnalyzerService,
  ],
  exports: [EvaluationOrchestratorService],
})
export class EvaluationModule {}
