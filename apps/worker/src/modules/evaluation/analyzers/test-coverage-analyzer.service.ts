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
      
      // More lenient base scoring - start with minimum 30 if any tests exist
      let baseScore = testFiles.length > 0 ? 30 : 0;
      
      // Add points for test ratio (up to 40 points)
      baseScore += Math.min(40, testRatio * 400);
      
      // Add points for having test framework (up to 15 points)
      if (hasTestFramework) {
        baseScore += 15;
      }
      
      // Count test assertions for better accuracy
      const assertions = await this.countAssertions(testFiles);
      const assertionsPerTest = assertions / (testFiles.length || 1);
      
      // Add points for assertion quality (up to 15 points)
      if (assertionsPerTest >= 10) {
        baseScore += 15;
      } else if (assertionsPerTest >= 5) {
        baseScore += 10;
      } else if (assertionsPerTest >= 2) {
        baseScore += 5;
      }
      
      const score = Math.min(100, baseScore);
      
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
