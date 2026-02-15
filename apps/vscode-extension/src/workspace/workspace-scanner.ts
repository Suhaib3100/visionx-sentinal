// Workspace Scanner - Analyzes workspace and generates metadata
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import ignore from 'ignore';

export interface TechStack {
  languages: string[];
  frameworks: string[];
  packageManager?: string;
}

export interface WorkspaceMetadata {
  projectHash: string;
  techStack: TechStack;
  fileTree: string[];
  locByLanguage: Record<string, number>;
  dependencyList: string[];
  gitInitialized: boolean;
}

export class WorkspaceScanner {
  private ignoreRules = ignore();

  constructor() {
    // Default ignore patterns
    this.ignoreRules.add([
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      '.vscode/**',
      '*.log',
      '.env*',
      'coverage/**',
      '.next/**',
      '.nuxt/**',
      'out/**',
      'target/**',
      'bin/**',
      '__pycache__/**',
      '*.pyc',
      '.DS_Store',
    ]);
  }

  async scanWorkspace(): Promise<WorkspaceMetadata | null> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return null;
    }

    const rootPath = workspaceFolder.uri.fsPath;

    // Load .gitignore if exists
    this.loadGitignore(rootPath);

    const fileTree = await this.buildFileTree(rootPath);
    const projectHash = this.generateHash(fileTree);
    const techStack = await this.detectTechStack(rootPath);
    const locByLanguage = await this.countLOC(rootPath, fileTree);
    const dependencyList = await this.extractDependencies(rootPath);
    const gitInitialized = fs.existsSync(path.join(rootPath, '.git'));

    return {
      projectHash,
      techStack,
      fileTree,
      locByLanguage,
      dependencyList,
      gitInitialized,
    };
  }

  private loadGitignore(rootPath: string): void {
    const gitignorePath = path.join(rootPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      this.ignoreRules.add(content.split('\n'));
    }
  }

  private async buildFileTree(rootPath: string): Promise<string[]> {
    const files: string[] = [];

    const walk = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(rootPath, fullPath);

        if (this.ignoreRules.ignores(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          files.push(relativePath);
        }
      }
    };

    walk(rootPath);
    return files.sort();
  }

  private generateHash(fileTree: string[]): string {
    const hash = crypto.createHash('sha256');
    hash.update(fileTree.join('\n'));
    return hash.digest('hex');
  }

  private async detectTechStack(rootPath: string): Promise<TechStack> {
    const languages: Set<string> = new Set();
    const frameworks: Set<string> = new Set();
    let packageManager: string | undefined;

    // Check for package.json
    const packageJsonPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      languages.add('JavaScript/TypeScript');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      if (packageJson.dependencies || packageJson.devDependencies) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.react) frameworks.add('React');
        if (deps.vue) frameworks.add('Vue');
        if (deps.next) frameworks.add('Next.js');
        if (deps.express) frameworks.add('Express');
        if (deps['@nestjs/core']) frameworks.add('NestJS');
      }

      if (fs.existsSync(path.join(rootPath, 'package-lock.json'))) {
        packageManager = 'npm';
      } else if (fs.existsSync(path.join(rootPath, 'yarn.lock'))) {
        packageManager = 'yarn';
      } else if (fs.existsSync(path.join(rootPath, 'pnpm-lock.yaml'))) {
        packageManager = 'pnpm';
      }
    }

    // Check for requirements.txt or setup.py
    if (fs.existsSync(path.join(rootPath, 'requirements.txt')) || 
        fs.existsSync(path.join(rootPath, 'setup.py'))) {
      languages.add('Python');
    }

    // Check for Cargo.toml
    if (fs.existsSync(path.join(rootPath, 'Cargo.toml'))) {
      languages.add('Rust');
    }

    // Check for go.mod
    if (fs.existsSync(path.join(rootPath, 'go.mod'))) {
      languages.add('Go');
    }

    return {
      languages: Array.from(languages),
      frameworks: Array.from(frameworks),
      packageManager,
    };
  }

  private async countLOC(rootPath: string, files: string[]): Promise<Record<string, number>> {
    const locByLanguage: Record<string, number> = {};

    for (const file of files) {
      const ext = path.extname(file);
      const langMap: Record<string, string> = {
        '.js': 'JavaScript',
        '.ts': 'TypeScript',
        '.jsx': 'React',
        '.tsx': 'React/TypeScript',
        '.py': 'Python',
        '.go': 'Go',
        '.rs': 'Rust',
        '.java': 'Java',
        '.cpp': 'C++',
        '.c': 'C',
      };

      const lang = langMap[ext] || 'Other';
      const fullPath = path.join(rootPath, file);
      
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        locByLanguage[lang] = (locByLanguage[lang] || 0) + lines.length;
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return locByLanguage;
  }

  private async extractDependencies(rootPath: string): Promise<string[]> {
    const dependencies: string[] = [];

    // Extract npm dependencies
    const packageJsonPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.dependencies) {
        dependencies.push(...Object.keys(packageJson.dependencies));
      }
      if (packageJson.devDependencies) {
        dependencies.push(...Object.keys(packageJson.devDependencies));
      }
    }

    // Extract Python dependencies
    const requirementsPath = path.join(rootPath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      const content = fs.readFileSync(requirementsPath, 'utf-8');
      dependencies.push(...content.split('\n').filter(line => line.trim().length > 0));
    }

    return dependencies;
  }
}
