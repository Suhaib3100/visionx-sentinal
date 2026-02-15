# 🏗️ VisionX Eval - Architecture & Codebase Structure

## 📁 Monorepo Folder Structure

```
visionx-eval/
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── extension.yml
│       ├── backend.yml
│       └── dashboard.yml
│
├── packages/
│   ├── shared/                 # Shared utilities & types
│   │   ├── src/
│   │   │   ├── types/         # TypeScript interfaces
│   │   │   │   ├── snapshot.ts
│   │   │   │   ├── evaluation.ts
│   │   │   │   ├── team.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   ├── scoring.ts
│   │   │   │   ├── languages.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   ├── hash.ts
│   │   │   │   ├── compression.ts
│   │   │   │   └── validation.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── eslint-config/         # Shared ESLint config
│       ├── index.js
│       └── package.json
│
├── apps/
│   ├── vscode-extension/      # VS Code Extension
│   │   ├── src/
│   │   │   ├── extension.ts   # Entry point
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   └── token.manager.ts
│   │   │   │   ├── scanner/
│   │   │   │   │   ├── workspace.scanner.ts
│   │   │   │   │   ├── tech-stack.detector.ts
│   │   │   │   │   ├── file-tree.builder.ts
│   │   │   │   │   └── git.handler.ts
│   │   │   │   ├── snapshot/
│   │   │   │   │   ├── snapshot.engine.ts
│   │   │   │   │   ├── snapshot.scheduler.ts
│   │   │   │   │   ├── diff.engine.ts
│   │   │   │   │   └── submission.lock.ts
│   │   │   │   ├── uploader/
│   │   │   │   │   ├── api.client.ts
│   │   │   │   │   ├── compression.handler.ts
│   │   │   │   │   └── retry.manager.ts
│   │   │   │   └── ui/
│   │   │   │       ├── status-bar.ts
│   │   │   │       ├── notification.service.ts
│   │   │   │       └── webview.provider.ts
│   │   │   ├── config/
│   │   │   │   ├── constants.ts
│   │   │   │   └── ignore-patterns.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   └── error-handler.ts
│   │   │   └── types/
│   │   │       └── extension.types.ts
│   │   ├── media/             # Icons, CSS for webviews
│   │   ├── test/
│   │   │   ├── suite/
│   │   │   └── fixtures/
│   │   ├── .vscodeignore
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── backend/               # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts        # Bootstrap
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── aws.config.ts
│   │   │   │   └── app.config.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   └── transform.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── roles.decorator.ts
│   │   │   │   └── dto/
│   │   │   │       ├── pagination.dto.ts
│   │   │   │       └── response.dto.ts
│   │   │   ├── modules/
│   │   │   │   ├── teams/
│   │   │   │   │   ├── teams.module.ts
│   │   │   │   │   ├── teams.controller.ts
│   │   │   │   │   ├── teams.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── team.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-team.dto.ts
│   │   │   │   │       └── team-response.dto.ts
│   │   │   │   ├── projects/
│   │   │   │   │   ├── projects.module.ts
│   │   │   │   │   ├── projects.controller.ts
│   │   │   │   │   ├── projects.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── project.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── snapshots/
│   │   │   │   │   ├── snapshots.module.ts
│   │   │   │   │   ├── snapshots.controller.ts
│   │   │   │   │   ├── snapshots.service.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── s3-upload.service.ts
│   │   │   │   │   │   ├── hash-validator.service.ts
│   │   │   │   │   │   └── queue-publisher.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── snapshot.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-snapshot.dto.ts
│   │   │   │   │       └── snapshot-response.dto.ts
│   │   │   │   ├── evaluations/
│   │   │   │   │   ├── evaluations.module.ts
│   │   │   │   │   ├── evaluations.controller.ts
│   │   │   │   │   ├── evaluations.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── static-metrics.entity.ts
│   │   │   │   │   │   ├── ai-report.entity.ts
│   │   │   │   │   │   └── final-score.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── leaderboard/
│   │   │   │   │   ├── leaderboard.module.ts
│   │   │   │   │   ├── leaderboard.controller.ts
│   │   │   │   │   ├── leaderboard.service.ts
│   │   │   │   │   ├── leaderboard.gateway.ts  # WebSocket
│   │   │   │   │   └── dto/
│   │   │   │   ├── judges/
│   │   │   │   │   ├── judges.module.ts
│   │   │   │   │   ├── judges.controller.ts
│   │   │   │   │   ├── judges.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── manual-override.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   └── auth/
│   │   │   │       ├── auth.module.ts
│   │   │   │       ├── auth.controller.ts
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── strategies/
│   │   │   │       │   ├── jwt.strategy.ts
│   │   │   │       │   └── local.strategy.ts
│   │   │   │       └── dto/
│   │   │   ├── database/
│   │   │   │   ├── migrations/
│   │   │   │   └── seeds/
│   │   │   └── utils/
│   │   │       ├── logger.util.ts
│   │   │       └── retry.util.ts
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── README.md
│   │
│   ├── worker/                # Evaluation Worker Service
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── worker.module.ts
│   │   │   ├── services/
│   │   │   │   ├── queue-consumer.service.ts
│   │   │   │   ├── evaluation-orchestrator.service.ts
│   │   │   │   ├── static-analysis/
│   │   │   │   │   ├── static-analyzer.service.ts
│   │   │   │   │   ├── lint-analyzer.ts
│   │   │   │   │   ├── complexity-analyzer.ts
│   │   │   │   │   ├── security-scanner.ts
│   │   │   │   │   ├── test-coverage.analyzer.ts
│   │   │   │   │   └── dependency-checker.ts
│   │   │   │   ├── ai-evaluation/
│   │   │   │   │   ├── ai-evaluator.service.ts
│   │   │   │   │   ├── llm-client.service.ts
│   │   │   │   │   ├── prompt-builder.service.ts
│   │   │   │   │   └── response-validator.service.ts
│   │   │   │   ├── scoring/
│   │   │   │   │   ├── score-calculator.service.ts
│   │   │   │   │   ├── weight-config.ts
│   │   │   │   │   └── leaderboard-updater.service.ts
│   │   │   │   ├── cheat-detection/
│   │   │   │   │   ├── anomaly-detector.service.ts
│   │   │   │   │   ├── similarity-checker.service.ts
│   │   │   │   │   └── growth-analyzer.service.ts
│   │   │   │   └── storage/
│   │   │   │       ├── s3-retriever.service.ts
│   │   │   │       └── cache.service.ts
│   │   │   ├── config/
│   │   │   │   ├── worker.config.ts
│   │   │   │   ├── llm.config.ts
│   │   │   │   └── analysis.config.ts
│   │   │   ├── utils/
│   │   │   │   ├── code-parser.util.ts
│   │   │   │   └── metrics.util.ts
│   │   │   └── types/
│   │   │       ├── analysis.types.ts
│   │   │       └── evaluation.types.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── dashboard/             # Next.js Admin Dashboard
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   └── register/
│       │   │   ├── (admin)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── dashboard/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── leaderboard/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── teams/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── evaluations/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── settings/
│       │   │   │       └── page.tsx
│       │   │   └── (judge)/
│       │   │       ├── layout.tsx
│       │   │       ├── shortlist/
│       │   │       │   └── page.tsx
│       │   │       └── compare/
│       │   │           └── page.tsx
│       │   ├── components/
│       │   │   ├── ui/              # shadcn/ui components
│       │   │   │   ├── button.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── table.tsx
│       │   │   │   └── ...
│       │   │   ├── layout/
│       │   │   │   ├── header.tsx
│       │   │   │   ├── sidebar.tsx
│       │   │   │   └── footer.tsx
│       │   │   ├── leaderboard/
│       │   │   │   ├── leaderboard-table.tsx
│       │   │   │   ├── score-breakdown.tsx
│       │   │   │   └── progress-chart.tsx
│       │   │   ├── evaluation/
│       │   │   │   ├── ai-feedback-panel.tsx
│       │   │   │   ├── risk-flags-list.tsx
│       │   │   │   ├── static-metrics-card.tsx
│       │   │   │   └── score-override-slider.tsx
│       │   │   ├── team/
│       │   │   │   ├── team-card.tsx
│       │   │   │   ├── snapshot-timeline.tsx
│       │   │   │   └── project-details.tsx
│       │   │   └── shared/
│       │   │       ├── loading-spinner.tsx
│       │   │       └── error-boundary.tsx
│       │   ├── lib/
│       │   │   ├── api/
│       │   │   │   ├── client.ts
│       │   │   │   ├── endpoints.ts
│       │   │   │   └── types.ts
│       │   │   ├── websocket/
│       │   │   │   └── socket-client.ts
│       │   │   ├── auth/
│       │   │   │   ├── session.ts
│       │   │   │   └── permissions.ts
│       │   │   └── utils/
│       │   │       ├── format.ts
│       │   │       ├── date.ts
│       │   │       └── score.ts
│       │   ├── hooks/
│       │   │   ├── use-leaderboard.ts
│       │   │   ├── use-websocket.ts
│       │   │   ├── use-evaluation.ts
│       │   │   └── use-auth.ts
│       │   ├── context/
│       │   │   ├── auth-context.tsx
│       │   │   └── theme-context.tsx
│       │   ├── types/
│       │   │   └── dashboard.types.ts
│       │   └── styles/
│       │       └── globals.css
│       ├── public/
│       │   ├── images/
│       │   └── icons/
│       ├── .env.local
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── infrastructure/            # AWS Infrastructure as Code
│   ├── terraform/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   ├── modules/
│   │   │   ├── vpc/
│   │   │   ├── ecs/
│   │   │   ├── rds/
│   │   │   ├── elasticache/
│   │   │   ├── s3/
│   │   │   ├── sqs/
│   │   │   └── alb/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloudformation/        # Alternative: CloudFormation templates
│   └── scripts/
│       ├── deploy.sh
│       └── rollback.sh
│
├── docs/                      # Documentation
│   ├── architecture/
│   │   ├── system-design.md
│   │   ├── database-schema.md
│   │   └── api-specs.md
│   ├── development/
│   │   ├── setup-guide.md
│   │   ├── coding-standards.md
│   │   └── testing-guide.md
│   ├── deployment/
│   │   ├── aws-setup.md
│   │   └── ci-cd.md
│   └── user-guides/
│       ├── extension-usage.md
│       └── dashboard-usage.md
│
├── scripts/                   # Root-level utility scripts
│   ├── setup.sh
│   ├── test-all.sh
│   ├── build-all.sh
│   └── clean.sh
│
├── .gitignore
├── .env.example
├── package.json               # Root package.json for workspace
├── pnpm-workspace.yaml        # or lerna.json / nx.json
├── tsconfig.base.json         # Base TypeScript config
└── README.md
```

## 🎯 Technology Stack

### VS Code Extension
- **Language**: TypeScript
- **Build Tool**: esbuild
- **Testing**: VS Code Test Suite
- **Dependencies**: 
  - `@vscode/vsce` (packaging)
  - `axios` (HTTP client)
  - `simple-git` (Git operations)
  - `ignore` (gitignore parsing)

### Backend (API Service)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Queue**: AWS SQS
- **Storage**: AWS S3
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

### Backend (Worker Service)
- **Framework**: NestJS
- **Static Analysis**:
  - ESLint
  - `@typescript-eslint/parser`
  - `jscpd` (code duplication)
  - `complexity-report`
  - `npm-audit` / `snyk` (security)
- **AI Integration**:
  - OpenAI SDK / Anthropic SDK
  - Custom prompt engineering

### Dashboard
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + SWR/TanStack Query
- **WebSocket**: Socket.IO client
- **Charts**: Recharts / Chart.js

### Infrastructure
- **IaC**: Terraform (preferred) or CloudFormation
- **Container**: Docker
- **Orchestration**: AWS ECS Fargate
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch + AWS X-Ray

## 🔑 Key Architectural Decisions

### 1. Monorepo Structure
**Decision**: Use pnpm workspaces
**Rationale**: 
- Shared types and utilities
- Atomic commits across services
- Simplified dependency management
- Better developer experience

### 2. Service Communication
**Decision**: REST API + SQS for async processing
**Rationale**:
- REST for synchronous operations (auth, snapshot upload)
- SQS for decoupled evaluation processing
- WebSocket for real-time updates

### 3. Database Strategy
**Decision**: PostgreSQL for OLTP, Redis for caching and leaderboard
**Rationale**:
- ACID guarantees for critical data
- Redis sorted sets perfect for leaderboards
- Cost-effective on AWS RDS

### 4. Evaluation Pipeline
**Decision**: Two-phase (Static → AI)
**Rationale**:
- Static analysis is fast and deterministic
- AI evaluation only for subjective scoring
- Reduces LLM API costs
- Provides explainable metrics

### 5. Extension State Management
**Decision**: Local storage + periodic sync
**Rationale**:
- Offline resilience
- Immediate feedback to users
- Retry mechanism for failed uploads

### 6. Cheat Detection
**Decision**: Passive monitoring + flagging (not blocking)
**Rationale**:
- False positives are common
- Human review for final decision
- Maintains hackathon spirit

## 📊 Data Flow

### Snapshot Upload Flow
```
VS Code Extension
    ↓ (HTTPS)
Backend API (/snapshots)
    ↓ (Store metadata in PostgreSQL)
    ↓ (Upload files to S3)
    ↓ (Publish message to SQS)
Worker Service
    ↓ (Consume from SQS)
    ↓ (Retrieve from S3)
    ↓ (Run static analysis)
    ↓ (Call LLM API)
    ↓ (Calculate scores)
    ↓ (Update PostgreSQL + Redis)
Dashboard
    ← (WebSocket notification)
    ← (REST API query for details)
```

## 🔒 Security Considerations

1. **Authentication**:
   - JWT tokens for extension ↔ backend
   - Separate admin/judge roles
   - Token rotation every 24 hours

2. **Data Protection**:
   - S3 bucket encryption at rest
   - TLS 1.3 for all communications
   - IAM roles with least privilege
   - No credentials in code (AWS Secrets Manager)

3. **Rate Limiting**:
   - 1 snapshot per team per 45 minutes
   - API rate limits per IP
   - SQS visibility timeout for retry protection

4. **Validation**:
   - Schema validation on all endpoints
   - File type whitelisting
   - Max file size limits (50MB per snapshot)
   - Sanitize all user inputs

## 📈 Scalability Strategy

### Current Load (300 Teams)
- **Snapshots/hour**: 300
- **Worker concurrency**: 10-15
- **RDS**: db.t3.medium
- **Redis**: cache.t3.small
- **ECS Tasks**: 2-3 per service

### Scale-Up Plan (1000+ Teams)
- **Horizontal**: More ECS tasks
- **Database**: Read replicas
- **Queue**: Multiple SQS queues by priority
- **Caching**: More aggressive Redis caching
- **CDN**: CloudFront for dashboard

## 🧪 Testing Strategy

### Extension
- Unit tests for each module
- Integration tests with mock backend
- E2E tests with test workspace

### Backend
- Unit tests (services, utilities)
- Integration tests (with test DB)
- E2E API tests (full request cycle)
- Load testing (k6 / Artillery)

### Worker
- Unit tests for analyzers
- Integration tests with mock LLM
- End-to-end evaluation tests

### Dashboard
- Component tests (React Testing Library)
- E2E tests (Playwright)
- Visual regression tests (Chromatic)

## 📦 Deployment Pipeline

### Development
1. Local development with Docker Compose
2. Push to feature branch
3. CI runs tests
4. Deploy to dev environment

### Staging
1. Merge to `develop` branch
2. Deploy to staging on ECS
3. Run smoke tests
4. Manual QA approval

### Production
1. Merge to `main` via PR
2. Tag release
3. Blue-green deployment on ECS
4. Automated smoke tests
5. Gradual traffic shift

## 🔍 Monitoring & Observability

### Metrics
- Request latency (p50, p95, p99)
- Error rates per endpoint
- Queue depth and processing time
- LLM API costs and latency
- Database connection pool usage

### Logging
- Structured JSON logs
- CloudWatch Logs with retention
- Error tracking (Sentry)

### Alerts
- High error rate
- Queue backlog > threshold
- Database connection failures
- S3 upload failures
- LLM API rate limits

---

**Next Step**: See [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) for phased implementation plan.
