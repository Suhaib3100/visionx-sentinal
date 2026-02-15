import { Injectable, Logger } from '@nestjs/common';
import { ESLint } from 'eslint';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class LintAnalyzerService {
  private readonly logger = new Logger(LintAnalyzerService.name);

  async analyze(workDir: string): Promise<number> {
    this.logger.log('Running lint analysis...');
    
    try {
      const eslint = new ESLint({
        useEslintrc: false,
        overrideConfigFile: null,
        baseConfig: {
          env: {
            node: true,
            es2021: true,
          },
          parserOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
          },
          rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-console': 'off',
            'no-debugger': 'warn',
          },
        },
      } as any);

      // Find all JS/TS files
      const files = await this.findJavaScriptFiles(workDir);
      
      if (files.length === 0) {
        this.logger.warn('No JavaScript/TypeScript files found');
        return 50; // Neutral score
      }

      // Run ESLint
      const results = await eslint.lintFiles(files);
      
      // Calculate score
      const totalFiles = results.length;
      const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
      const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
      
      // Score calculation: 100 - (errors * 5 + warnings * 2) / totalFiles
      const deductions = (totalErrors * 5 + totalWarnings * 2) / totalFiles;
      const score = Math.max(0, Math.min(100, 100 - deductions));
      
      this.logger.log(
        `Lint analysis complete: ${totalFiles} files, ${totalErrors} errors, ${totalWarnings} warnings, score: ${score.toFixed(2)}`
      );
      
      return score;
      
    } catch (error) {
      this.logger.error(`Lint analysis failed: ${error.message}`, error.stack);
      return 0;
    }
  }

  private async findJavaScriptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        // Skip node_modules and hidden directories
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath);
        } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    
    await scan(dir);
    return files;
  }
}
