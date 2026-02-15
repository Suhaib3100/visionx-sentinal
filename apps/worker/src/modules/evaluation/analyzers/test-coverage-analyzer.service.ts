import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TestCoverageAnalyzerService {
  private readonly logger = new Logger(TestCoverageAnalyzerService.name);

  async analyze(workDir: string): Promise<number> {
    this.logger.log('Running test coverage analysis...');
    
    try {
      // Find all code files
      const codeFiles = await this.findCodeFiles(workDir, false);
      const testFiles = await this.findCodeFiles(workDir, true);
      
      if (codeFiles.length === 0) {
        this.logger.warn('No code files found');
        return 0;
      }
      
      // Calculate test file ratio
      const testRatio = testFiles.length / codeFiles.length;
      
      // Check for test frameworks in package.json
      const hasTestFramework = await this.checkTestFramework(workDir);
      
      // Estimate coverage based on test ratio and test assertions
      let estimatedCoverage = testRatio * 100;
      
      if (!hasTestFramework) {
        estimatedCoverage *= 0.5; // Penalize if no test framework detected
      }
      
      // Count test assertions for better accuracy
      const assertions = await this.countAssertions(testFiles);
      const assertionsPerTest = assertions / (testFiles.length || 1);
      
      // Adjust score based on assertion quality
      if (assertionsPerTest < 2) {
        estimatedCoverage *= 0.7;
      } else if (assertionsPerTest > 5) {
        estimatedCoverage = Math.min(100, estimatedCoverage * 1.2);
      }
      
      const score = Math.min(100, estimatedCoverage);
      
      this.logger.log(
        `Test coverage analysis complete: ${testFiles.length} test files, ${codeFiles.length} code files, ${assertions} assertions, score: ${score.toFixed(2)}`
      );
      
      return score;
      
    } catch (error) {
      this.logger.error(`Test coverage analysis failed: ${error.message}`, error.stack);
      return 0;
    }
  }

  private async findCodeFiles(dir: string, testsOnly: boolean): Promise<string[]> {
    const files: string[] = [];
    
    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath);
        } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
          const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$|__tests__/.test(fullPath);
          
          if ((testsOnly && isTestFile) || (!testsOnly && !isTestFile)) {
            files.push(fullPath);
          }
        }
      }
    }
    
    await scan(dir);
    return files;
  }

  private async checkTestFramework(workDir: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(workDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      const testFrameworks = ['jest', 'mocha', 'jasmine', 'vitest', 'ava'];
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      return testFrameworks.some(framework => framework in allDeps);
      
    } catch {
      return false;
    }
  }

  private async countAssertions(testFiles: string[]): Promise<number> {
    let totalAssertions = 0;
    
    for (const file of testFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        // Count common assertion patterns
        const assertions = (
          content.match(/expect\(/g) ||
          content.match(/assert\./g) ||
          content.match(/should\./g) ||
          []
        ).length;
        
        totalAssertions += assertions;
        
      } catch (error) {
        this.logger.warn(`Failed to read test file ${file}`);
      }
    }
    
    return totalAssertions;
  }
}
