# 🚀 Quick Start Guide - VisionX Eval

## Ready to Start? Follow This Checklist!

### 📋 Prerequisites
Before starting development, ensure you have:

- [ ] **Node.js** (v18+) and **pnpm** installed
- [ ] **Docker** and **Docker Compose** installed
- [ ] **PostgreSQL** client tools (optional, for DB management)
- [ ] **AWS CLI** configured (for later phases)
- [ ] **VS Code** with recommended extensions:
  - ESLint
  - Prettier
  - Docker
  - REST Client
  - Thunder Client (API testing)
- [ ] **Git** configured with your credentials
- [ ] **GitHub** account with repo access

---

## 🎯 Phase 0: Getting Started (Start Here!)

### Step 1: Initialize Monorepo Structure

```bash
# Create root directory (if not already in it)
cd visionx-eval

# Initialize pnpm workspace
pnpm init

# Create folder structure
mkdir -p apps packages infrastructure docs scripts
mkdir -p packages/shared packages/eslint-config
mkdir -p apps/vscode-extension apps/backend apps/worker apps/dashboard
mkdir -p infrastructure/terraform infrastructure/scripts
mkdir -p docs/architecture docs/development docs/deployment docs/user-guides
mkdir -p .github/workflows
```

### Step 2: Configure pnpm Workspace

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Update `package.json`:
```json
{
  "name": "visionx-eval",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel dev",
    "build": "pnpm --parallel build",
    "test": "pnpm --parallel test",
    "lint": "pnpm --parallel lint",
    "clean": "pnpm --parallel clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### Step 3: Set Up Shared Package

```bash
cd packages/shared
pnpm init
```

Create `packages/shared/package.json`:
```json
{
  "name": "@visionx/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.2.0"
  }
}
```

Create `packages/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Create shared type files:

**`packages/shared/src/types/snapshot.ts`**:
```typescript
export interface Snapshot {
  teamId: string;
  projectId: string;
  timestamp: Date;
  projectHash: string;
  techStack: TechStack;
  fileTree: FileNode[];
  locByLanguage: Record<string, number>;
  dependencyList: Dependency[];
  commitStats?: CommitStats;
  changedFiles: ChangedFile[];
}

export interface TechStack {
  primary: string;
  frameworks: string[];
  languages: string[];
}

export interface FileNode {
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
}

export interface CommitStats {
  latestCommit: string;
  author: string;
  message: string;
  commitCount: number;
}

export interface ChangedFile {
  path: string;
  content: string;
  size: number;
  language: string;
}
```

**`packages/shared/src/types/evaluation.ts`**:
```typescript
export interface StaticMetrics {
  snapshotId: string;
  lintScore: number;
  complexityScore: number;
  securityScore: number;
  testScore: number;
  structureScore: number;
  buildScore: number;
}

export interface AIReport {
  snapshotId: string;
  innovationScore: number;
  architectureScore: number;
  scalabilityScore: number;
  alignmentScore: number;
  readabilityScore: number;
  documentationScore: number;
  feedback: string;
  riskFlags: string[];
}

export interface FinalScore {
  projectId: string;
  totalScore: number;
  staticScore: number;
  aiScore: number;
  breakdown: ScoreBreakdown;
  lastUpdated: Date;
}

export interface ScoreBreakdown {
  static: StaticMetrics;
  ai: AIReport;
}
```

**`packages/shared/src/types/team.ts`**:
```typescript
export interface Team {
  id: string;
  name: string;
  token: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  teamId: string;
  theme: string;
  problemStatement: string;
  createdAt: Date;
}
```

**`packages/shared/src/constants/scoring.ts`**:
```typescript
export const SCORING_WEIGHTS = {
  STATIC: 0.6,
  AI: 0.4,
};

export const STATIC_WEIGHTS = {
  LINT: 0.15,
  COMPLEXITY: 0.15,
  SECURITY: 0.20,
  TEST: 0.20,
  STRUCTURE: 0.15,
  BUILD: 0.15,
};

export const AI_WEIGHTS = {
  INNOVATION: 0.25,
  ARCHITECTURE: 0.20,
  SCALABILITY: 0.15,
  ALIGNMENT: 0.20,
  READABILITY: 0.10,
  DOCUMENTATION: 0.10,
};
```

**`packages/shared/src/index.ts`**:
```typescript
export * from './types/snapshot';
export * from './types/evaluation';
export * from './types/team';
export * from './constants/scoring';
```

### Step 4: Configure ESLint & Prettier

Create `.eslintrc.js`:
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Step 5: Configure Git Hooks (Husky)

```bash
# Install dependencies
pnpm install

# Initialize Husky
pnpm exec husky install

# Create pre-commit hook
pnpm exec husky add .husky/pre-commit "pnpm exec lint-staged"
```

Create `.lintstagedrc.js`:
```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
```

### Step 6: Create .gitignore

Create `.gitignore`:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/

# Temporary
*.tmp
*.temp
.cache/
```

### Step 7: Create Environment Template

Create `.env.example`:
```env
# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/visionx
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-here

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=visionx-snapshots
SQS_QUEUE_URL=

# LLM
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Step 8: Set Up Docker Compose (for Local Development)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: visionx-postgres
    environment:
      POSTGRES_DB: visionx
      POSTGRES_USER: visionx_user
      POSTGRES_PASSWORD: visionx_pass
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U visionx_user']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: visionx-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

### Step 9: Create Helper Scripts

Create `scripts/setup.sh`:
```bash
#!/bin/bash

echo "🚀 Setting up VisionX Eval development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required"; exit 1; }

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and fill in values"
echo "2. Navigate to apps/backend and run migrations: pnpm run migration:run"
echo "3. Start development: pnpm run dev"
```

Make it executable:
```bash
chmod +x scripts/setup.sh
```

Create `scripts/clean.sh`:
```bash
#!/bin/bash

echo "🧹 Cleaning VisionX Eval..."

pnpm run clean
docker-compose down -v
rm -rf node_modules

echo "✅ Clean complete!"
```

Make it executable:
```bash
chmod +x scripts/clean.sh
```

### Step 10: Create README

Create `README.md`:
```markdown
# 🎯 VisionX Eval - AI-Powered Hackathon Evaluation Platform

Automated evaluation system for hackathon projects using static analysis and LLM evaluation.

## 🏗️ Architecture

- **VS Code Extension**: Captures project snapshots
- **Backend API**: Handles authentication and snapshot ingestion
- **Worker Service**: Runs evaluations (static analysis + AI)
- **Admin Dashboard**: Real-time leaderboard and management

## 📁 Project Structure

```
visionx-eval/
├── apps/
│   ├── vscode-extension/    # VS Code extension
│   ├── backend/             # NestJS API
│   ├── worker/              # Evaluation worker
│   └── dashboard/           # Next.js dashboard
├── packages/
│   └── shared/              # Shared types & utilities
├── infrastructure/          # Terraform/IaC
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- AWS CLI (for deployment)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd visionx-eval
   ```

2. **Run setup script**
   ```bash
   ./scripts/setup.sh
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start development**
   ```bash
   pnpm run dev
   ```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System design and folder structure
- [Development Phases](./DEVELOPMENT_PHASES.md) - Detailed implementation plan
- [Building](./building.md) - Original requirements document

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Start all services in dev mode
pnpm run dev

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Build all packages
pnpm run build
```

## 📦 Monorepo Structure

This project uses pnpm workspaces for monorepo management:

- `apps/*`: Standalone applications
- `packages/*`: Shared libraries

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## 📄 License

MIT
```

### Step 11: Initialize Git and First Commit

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial project setup: monorepo structure, shared types, and dev environment"

# Create development branch
git checkout -b develop
```

### Step 12: Verify Setup

Run these commands to verify everything is set up correctly:

```bash
# Check pnpm workspace
pnpm list -r

# Build shared package
cd packages/shared
pnpm run build

# Check if Docker services are running
docker-compose ps

# Run linting
pnpm run lint
```

---

## ✅ Phase 0 Checklist

Use this checklist to track your Phase 0 progress:

- [ ] Monorepo structure created
- [ ] pnpm workspace configured
- [ ] Shared package with types created and builds successfully
- [ ] ESLint and Prettier configured
- [ ] Git hooks set up with Husky
- [ ] `.gitignore` and `.env.example` created
- [ ] Docker Compose configured for local PostgreSQL and Redis
- [ ] Helper scripts created and tested
- [ ] README.md written
- [ ] Initial git commit made
- [ ] Documentation reviewed (ARCHITECTURE.md, DEVELOPMENT_PHASES.md)

---

## 🎯 Next Steps

Once Phase 0 is complete:

1. **Start Phase 1**: Set up the NestJS backend
   - Navigate to `apps/backend`
   - Follow [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) Phase 1

2. **Join the Team**: Familiarize yourself with:
   - [Architecture document](./ARCHITECTURE.md)
   - [Original requirements](./building.md)
   - Database schema design

3. **Set Up IDE**: Install recommended VS Code extensions:
   - ESLint
   - Prettier
   - REST Client
   - Docker

---

## 💡 Pro Tips

- **Use pnpm filtering**: `pnpm --filter @visionx/backend dev`
- **Parallel execution**: `pnpm --parallel test`
- **Watch mode**: Most packages support `pnpm run dev` for auto-rebuild
- **Clean everything**: `./scripts/clean.sh` when things get messy

---

## 🆘 Troubleshooting

### pnpm install fails
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

### Docker services not starting
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

### TypeScript compilation errors
```bash
# Clean and rebuild
pnpm run clean
pnpm run build
```

---

**You're all set! Start with Phase 0 and follow the development phases. Good luck! 🚀**
