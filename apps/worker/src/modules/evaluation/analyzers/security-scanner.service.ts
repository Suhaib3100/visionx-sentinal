import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SecurityIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number;
  description: string;
}

@Injectable()
export class SecurityScannerService {
  private readonly logger = new Logger(SecurityScannerService.name);

  async scan(workDir: string): Promise<number> {
    this.logger.log('Running security scan...');
    
    try {
      const files = await this.findCodeFiles(workDir);
      const issues: SecurityIssue[] = [];
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const fileIssues = this.scanFile(file, content);
        issues.push(...fileIssues);
      }
      
      // Also check package.json for dependency vulnerabilities
      const packageJsonPath = path.join(workDir, 'package.json');
      try {
        await fs.access(packageJsonPath);
        // In production, run npm audit or similar
        this.logger.log('Found package.json, dependency scan recommended');
      } catch {
        // No package.json
      }
      
      // Calculate score based on issues
      const score = this.calculateSecurityScore(issues);
      
      this.logger.log(
        `Security scan complete: ${issues.length} issues found, score: ${score.toFixed(2)}`
      );
      
      return score;
      
    } catch (error) {
      this.logger.error(`Security scan failed: ${error.message}`, error.stack);
      return 0;
    }
  }

  private scanFile(filePath: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for hardcoded secrets
      if (this.hasHardcodedSecret(line)) {
        issues.push({
          type: 'hardcoded-secret',
          severity: 'critical',
          file: filePath,
          line: lineNum,
          description: 'Potential hardcoded secret or API key detected',
        });
      }
      
      // Check for SQL injection risks
      if (this.hasSQLInjectionRisk(line)) {
        issues.push({
          type: 'sql-injection',
          severity: 'high',
          file: filePath,
          line: lineNum,
          description: 'Potential SQL injection vulnerability',
        });
      }
      
      // Check for XSS risks
      if (this.hasXSSRisk(line)) {
        issues.push({
          type: 'xss',
          severity: 'high',
          file: filePath,
          line: lineNum,
          description: 'Potential XSS vulnerability',
        });
      }
      
      // Check for eval usage
      if (/\beval\s*\(/.test(line)) {
        issues.push({
          type: 'dangerous-function',
          severity: 'high',
          file: filePath,
          line: lineNum,
          description: 'Usage of dangerous eval() function',
        });
      }
      
      // Check for unsafe deserialization
      if (/JSON\.parse\([^)]*\)/.test(line) && !line.includes('try')) {
        issues.push({
          type: 'unsafe-deserialization',
          severity: 'medium',
          file: filePath,
          line: lineNum,
          description: 'Unsafe JSON parsing without error handling',
        });
      }
    }
    
    return issues;
  }

  private hasHardcodedSecret(line: string): boolean {
    const patterns = [
      /api[_-]?key\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i,
      /secret\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i,
      /password\s*[=:]\s*['"][^'"]+['"]/i,
      /token\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i,
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private hasSQLInjectionRisk(line: string): boolean {
    // Check for string concatenation in SQL queries
    return (
      /\b(query|execute)\s*\([^)]*\+[^)]*\)/i.test(line) ||
      /\$\{[^}]*\}/.test(line) && /select|insert|update|delete/i.test(line)
    );
  }

  private hasXSSRisk(line: string): boolean {
    // Check for innerHTML or dangerouslySetInnerHTML
    return (
      /\.innerHTML\s*=/.test(line) ||
      /dangerouslySetInnerHTML/.test(line)
    );
  }

  private calculateSecurityScore(issues: SecurityIssue[]): number {
    if (issues.length === 0) {
      return 100;
    }
    
    // Weight by severity  - more lenient scoring
    const severityWeights = {
      critical: 15,
      high: 8,
      medium: 3,
      low: 1,
    };
    
    const totalDeductions = issues.reduce(
      (sum, issue) => sum + severityWeights[issue.severity],
      0
    );
    
    // Cap deductions at reasonable level - don't penalize too harshly
    const normalizedDeductions = Math.min(totalDeductions, 80);
    
    return Math.max(20, 100 - normalizedDeductions);
  }

  private async findCodeFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath);
        } else if (entry.isFile() && /\.(js|ts|jsx|tsx|py|java|go)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    
    await scan(dir);
    return files;
  }
}
