import { Injectable, Logger } from '@nestjs/common';

export interface CodeEvaluationContext {
  projectName: string;
  teamName: string;
  description?: string;
  files: Array<{
    path: string;
    content: string;
    size: number;
  }>;
  staticMetrics: {
    lintScore: number;
    complexityScore: number;
    securityScore: number;
    testCoverageScore: number;
    totalFiles: number;
    totalLines: number;
  };
}

@Injectable()
export class PromptBuilderService {
  private readonly logger = new Logger(PromptBuilderService.name);
  private readonly MAX_FILES = 40; // Increased file count for better context
  private readonly MAX_FILE_SIZE = 15000; // Increased chars per file
  private readonly MAX_TOTAL_CHARS = 100000; // Increased total limit for detailed analysis

  /**
   * Build a comprehensive evaluation prompt for the LLM
   */
  buildEvaluationPrompt(context: CodeEvaluationContext): string {
    const { projectName, teamName, description, files, staticMetrics } = context;

    // Select and truncate files intelligently
    const selectedFiles = this.selectRelevantFiles(files);
    const truncatedFiles = this.truncateFiles(selectedFiles);

    const prompt = `
# Hackathon Project Evaluation

## Project Information
- **Project Name**: ${projectName}
- **Team Name**: ${teamName}
${description ? `- **Description**: ${description}` : ''}

## Static Analysis Metrics
- **Lint Score**: ${staticMetrics.lintScore}/100
- **Complexity Score**: ${staticMetrics.complexityScore}/100
- **Security Score**: ${staticMetrics.securityScore}/100
- **Test Coverage Score**: ${staticMetrics.testCoverageScore}/100
- **Total Files**: ${staticMetrics.totalFiles}
- **Total Lines**: ${staticMetrics.totalLines}

## Code Review

Below are key files from the project for your review:

${truncatedFiles.map((file, idx) => `
### File ${idx + 1}: ${file.path}
\`\`\`
${file.content}
\`\`\`
`).join('\n')}

## Evaluation Criteria

**IMPORTANT**: Provide a HIGHLY DISCRIMINATING evaluation. Look for specific differences in:
- **Code organization** and module structure
- **Implementation patterns** and approaches used
- **Feature completeness** and functional depth
- **Code quality** indicators (error handling, validation, logging)
- **Technical depth** (database design, API design, architecture)
- **Innovation** in problem-solving

Be CRITICAL and DIFFERENTIATE between projects. Identical scores are unacceptable unless projects are truly identical.

Rate each dimension on a 0-100 scale with PRECISION:

1. **Innovation Score (0-100)**: Novel approaches, creative solutions, unique features
   - Basic CRUD: 40-55
   - Standard patterns: 55-70  
   - Some unique features: 70-82
   - Highly innovative: 82-95

2. **Architecture Score (0-100)**: Code structure, design patterns, modularity
   - Poor structure: 30-50
   - Basic organization: 50-68
   - Well-structured: 68-82
   - Excellent architecture: 82-95

3. **Scalability Score (0-100)**: Production-readiness, performance, optimization
   - Not production-ready: 35-50
   - Basic foundation: 50-65
   - Good practices: 65-80
   - Production-grade: 80-95

4. **Alignment Score (0-100)**: Functional completeness, problem-solving
   - Partially working: 45-60
   - Core features working: 60-75
   - Fully functional: 75-88
   - Polished & complete: 88-98

5. **Readability Score (0-100)**: Code clarity, naming, comments
   - Hard to follow: 35-52
   - Acceptable: 52-68
   - Clear & clean: 68-83
   - Exemplary: 83-95

6. **Documentation Score (0-100)**: README, comments, API docs
   - Minimal/missing: 20-40
   - Basic README: 40-58
   - Good documentation: 58-75
   - Comprehensive: 75-92

**Analysis Requirements**:
- **Feedback**: Write 4-6 sentences with SPECIFIC observations about THIS project:
  * Name specific files, components, or features observed
  * Identify unique implementation choices or patterns
  * Point out concrete strengths (e.g., "The error handling in auth.service.ts is robust")
  * Note specific improvements (e.g., "Add input validation to the /api/upload endpoint")
  * Be SPECIFIC, not generic
  
- **Risk Flags**: List 2-5 SPECIFIC issues with file/line references:
  * "Hardcoded AWS credentials in config/aws.ts line 23"
  * "SQL injection risk in services/user.service.ts line 145"
  * "Missing error boundaries in React components"
  * Empty array ONLY if code is truly excellent

**Critical**: Analyze the ACTUAL code shown. Scores must reflect observable differences in implementation quality, complexity, and completeness.

## Response Format

Respond with a JSON object. Example for a well-architected project with good implementation:
{
  "innovation_score": 78,
  "architecture_score": 85,
  "scalability_score": 72,
  "alignment_score": 88,
  "readability_score": 79,
  "documentation_score": 63,
  "feedback": "This project demonstrates a well-structured multi-service architecture with NestJS backend (apps/backend/src/modules/), Next.js dashboard (apps/dashboard/src/), and worker service for background processing. The modular organization in src/modules/ shows good separation of concerns with dedicated modules for auth, database, and evaluation logic. The Entity-Service-Controller pattern is consistently applied. TypeScript usage is strong throughout with proper type definitions. However, the project lacks comprehensive documentation - while README files exist, inline code comments are sparse in complex modules like evaluation-orchestrator.service.ts. Test coverage is minimal with only basic smoke tests present. Error handling could be improved in the API layer, particularly around file upload endpoints. The implementation is functional and demonstrates solid architecture, but needs attention to code documentation and testing to be production-ready.",
  "risk_flags": ["Limited test coverage (< 10% based on file count)", "Missing input validation in file upload handlers", "Hardcoded configuration values in multiple service files", "No rate limiting on API endpoints"]
}

**Remember**: Every project is unique. Analyze the ACTUAL code and provide DIFFERENT scores based on what you observe. If you see a basic/incomplete project, scores should be 40-65 range. For solid implementations: 65-85. For exceptional work: 85-95.
`;

    this.logger.log(
      `Built evaluation prompt: ${prompt.length} characters, ${selectedFiles.length} files`
    );

    return prompt;
  }

  /**
   * Select the most relevant files for evaluation
   * Prioritize: config files, main entry points, unique implementations
   */
  private selectRelevantFiles(
    files: CodeEvaluationContext['files']
  ): CodeEvaluationContext['files'] {
    // Priority scoring for files
    const scoredFiles = files.map((file) => {
      let score = 0;
      const lowerPath = file.path.toLowerCase();

      // High priority files
      if (lowerPath.includes('readme')) score += 50;
      if (lowerPath.includes('main') || lowerPath.includes('index')) score += 40;
      if (lowerPath.includes('app') || lowerPath.includes('server')) score += 35;
      if (lowerPath.includes('config')) score += 30;
      if (lowerPath.includes('controller') || lowerPath.includes('service')) score += 32;
      if (lowerPath.includes('route') || lowerPath.includes('api')) score += 33;
      if (lowerPath.includes('model') || lowerPath.includes('schema')) score += 31;
      if (lowerPath.includes('util') || lowerPath.includes('helper')) score += 28;
      if (lowerPath.includes('component')) score += 30;
      if (lowerPath.endsWith('.ts') || lowerPath.endsWith('.js')) score += 25;
      if (lowerPath.endsWith('.tsx') || lowerPath.endsWith('.jsx')) score += 25;
      if (lowerPath.endsWith('.py')) score += 25;
      if (lowerPath.endsWith('.go') || lowerPath.endsWith('.java')) score += 25;

      // Package/config files
      if (lowerPath.includes('package.json')) score += 45;
      if (lowerPath.includes('tsconfig') || lowerPath.includes('webpack')) score += 20;
      
      // Lower priority
      if (lowerPath.includes('test') || lowerPath.includes('.spec.')) score -= 10;
      if (lowerPath.includes('node_modules')) score -= 100;
      if (lowerPath.includes('dist') || lowerPath.includes('build')) score -= 50;
      if (lowerPath.endsWith('.json') && !lowerPath.includes('package')) score -= 20;
      
      // Add small random factor for diversity (±5 points)
      score += Math.random() * 10 - 5;

      return { file, score };
    });

    // Sort by score and take top N
    return scoredFiles
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_FILES)
      .map((item) => item.file);
  }

  /**
   * Truncate file contents to stay within token limits
   */
  private truncateFiles(
    files: CodeEvaluationContext['files']
  ): CodeEvaluationContext['files'] {
    let totalChars = 0;
    const truncated: CodeEvaluationContext['files'] = [];

    for (const file of files) {
      if (totalChars >= this.MAX_TOTAL_CHARS) {
        break;
      }

      const remainingChars = this.MAX_TOTAL_CHARS - totalChars;
      const maxChars = Math.min(this.MAX_FILE_SIZE, remainingChars);

      if (file.content.length > maxChars) {
        // Truncate and add indicator
        truncated.push({
          ...file,
          content: file.content.substring(0, maxChars) + '\n\n... (truncated)',
        });
        totalChars += maxChars;
      } else {
        truncated.push(file);
        totalChars += file.content.length;
      }
    }

    return truncated;
  }

  /**
   * Build a simple test prompt for validation
   */
  buildTestPrompt(): string {
    return `
Evaluate this sample hackathon project:

Project: Hello World API
Team: Test Team

File: main.py
\`\`\`python
def hello():
    return "Hello World"
\`\`\`

Provide scores (0-100) for: innovation_score, architecture_score, scalability_score, 
alignment_score, readability_score, documentation_score, feedback (string), 
and risk_flags (array).

Respond with valid JSON only.
`;
  }
}
