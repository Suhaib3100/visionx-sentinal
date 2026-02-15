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
  private readonly MAX_FILES = 20; // Limit files sent to LLM
  private readonly MAX_FILE_SIZE = 10000; // Max characters per file
  private readonly MAX_TOTAL_CHARS = 50000; // Total prompt size limit

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

Please evaluate this hackathon project on the following dimensions (0-100 scale):

1. **Innovation Score**: How novel and creative is the solution? Does it show unique thinking?
2. **Architecture Score**: Is the code well-structured? Good separation of concerns?
3. **Scalability Score**: Can this solution scale? Is it production-ready?
4. **Alignment Score**: How well does it solve the problem? Is it functional?
5. **Readability Score**: Is the code clean and easy to understand?
6. **Documentation Score**: Are there comments, README, or API docs?

Also provide:
- **Feedback**: Constructive 2-3 sentence summary highlighting strengths and areas for improvement
- **Risk Flags**: Array of any concerning patterns (empty array if none)

## Response Format

Respond with a JSON object in this exact format:
{
  "innovation_score": 75,
  "architecture_score": 80,
  "scalability_score": 65,
  "alignment_score": 85,
  "readability_score": 70,
  "documentation_score": 60,
  "feedback": "Strong implementation with good architecture. Consider adding more documentation and improving error handling.",
  "risk_flags": []
}
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
      if (lowerPath.endsWith('.ts') || lowerPath.endsWith('.js')) score += 25;
      if (lowerPath.endsWith('.tsx') || lowerPath.endsWith('.jsx')) score += 25;
      if (lowerPath.endsWith('.py')) score += 25;

      // Lower priority
      if (lowerPath.includes('test') || lowerPath.includes('.spec.')) score -= 10;
      if (lowerPath.includes('node_modules')) score -= 100;
      if (lowerPath.includes('dist') || lowerPath.includes('build')) score -= 50;
      if (lowerPath.endsWith('.json') && !lowerPath.includes('package')) score -= 20;

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
