import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
// const escomplex = require('escomplex');

@Injectable()
export class ComplexityAnalyzerService {
  private readonly logger = new Logger(ComplexityAnalyzerService.name);

  async analyze(workDir: string): Promise<number> {
    this.logger.log('Running complexity analysis...');
    
    try {
      const files = await this.findJavaScriptFiles(workDir);
      
      if (files.length === 0) {
        this.logger.warn('No JavaScript files found for complexity analysis');
        return 50;
      }

      let totalComplexity = 0;
      let functionCount = 0;
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Simple complexity estimation based on code patterns
          // In production, use escomplex or similar library
          const complexity = this.estimateComplexity(content);
          totalComplexity += complexity.total;
          functionCount += complexity.functions;
          
        } catch (error) {
          this.logger.warn(`Failed to analyze file ${file}: ${error.message}`);
        }
      }
      
      if (functionCount === 0) {
        return 50;
      }
      
      const avgComplexity = totalComplexity / functionCount;
      
      // Score calculation: Lower complexity = higher score
      // Good: < 5, Acceptable: 5-10, Poor: > 10
      let score: number;
      if (avgComplexity < 5) {
        score = 100;
      } else if (avgComplexity < 10) {
        score = 100 - ((avgComplexity - 5) * 10);
      } else {
        score = Math.max(0, 50 - ((avgComplexity - 10) * 5));
      }
      
      this.logger.log(
        `Complexity analysis complete: ${functionCount} functions, avg complexity: ${avgComplexity.toFixed(2)}, score: ${score.toFixed(2)}`
      );
      
      return score;
      
    } catch (error) {
      this.logger.error(`Complexity analysis failed: ${error.message}`, error.stack);
      return 0;
    }
  }

  private estimateComplexity(code: string): { total: number; functions: number } {
    // Simple heuristic-based complexity estimation
    const lines = code.split('\n');
    let total = 0;
    let functions = 0;
    
    for (const line of lines) {
      // Count decision points
      if (/\b(if|else|for|while|switch|case|catch|\?)\b/.test(line)) {
        total += 1;
      }
      
      // Count logical operators
      const logicalOps = (line.match(/&&|\|\|/g) || []).length;
      total += logicalOps;
      
      // Count functions
      if (/function\s+\w+|const\s+\w+\s*=\s*(async\s+)?\(|=>\s*{/.test(line)) {
        functions += 1;
        total += 1; // Base complexity for function
      }
    }
    
    return { total: total || 1, functions: functions || 1 };
  }

  private async findJavaScriptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath);
        } else if (entry.isFile() && /\.(js|ts)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    
    await scan(dir);
    return files;
  }
}
