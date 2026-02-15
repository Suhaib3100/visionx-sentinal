# 🚀 Development Phases - VisionX Eval

## Overview
This document outlines a 6-phase development plan with clear milestones, deliverables, and testing criteria.

---

## 🎯 Phase 0: Project Setup & Foundation (Week 1)

### Goals
- Set up monorepo structure
- Configure development environment
- Establish shared utilities and types
- Set up CI/CD foundations

### Tasks

#### 0.1 Repository Setup
- [ ] Initialize monorepo with pnpm workspaces
- [ ] Create folder structure (apps/, packages/, infrastructure/)
- [ ] Set up root `package.json` with workspace configuration
- [ ] Configure `.gitignore` (node_modules, .env, dist, etc.)
- [ ] Create `.env.example` files

#### 0.2 Shared Package
- [ ] Create `packages/shared` with TypeScript setup
- [ ] Define core types:
  - `types/snapshot.ts` - Snapshot interface
  - `types/evaluation.ts` - Evaluation result types
  - `types/team.ts` - Team and project types
  - `types/scoring.ts` - Score breakdown types
- [ ] Implement shared utilities:
  - `utils/hash.ts` - Project hash generation
  - `utils/compression.ts` - Payload compression
  - `utils/validation.ts` - Input validation helpers
- [ ] Create constants:
  - `constants/scoring.ts` - Scoring weights
  - `constants/languages.ts` - Supported languages
  - `constants/analysis.ts` - Analysis thresholds

#### 0.3 Development Tools
- [ ] Configure ESLint (shared config in `packages/eslint-config`)
- [ ] Configure Prettier
- [ ] Set up Husky git hooks (pre-commit linting)
- [ ] Configure VS Code workspace settings
- [ ] Create `scripts/setup.sh` for initial environment setup

#### 0.4 Documentation
- [ ] Create `README.md` with project overview
- [ ] Write `docs/development/setup-guide.md`
- [ ] Write `docs/development/coding-standards.md`
- [ ] Create PR template
- [ ] Create issue templates

#### 0.5 CI/CD Foundation
- [ ] Set up GitHub Actions workflows:
  - `.github/workflows/lint.yml` - Linting on PRs
  - `.github/workflows/test.yml` - Testing on PRs
- [ ] Configure branch protection rules

### Deliverables
✅ Monorepo structure in place  
✅ Shared types and utilities available  
✅ Development environment documented  
✅ CI pipeline running  

### Success Criteria
- All developers can clone and run `pnpm install` successfully
- Shared packages can be imported in apps
- CI passes on test PRs

---

## 📦 Phase 1: Backend API Foundation (Weeks 2-3)

### Goals
- Set up NestJS backend with database
- Implement core API endpoints
- Enable snapshot ingestion and storage

### Tasks

#### 1.1 Backend Bootstrap
- [ ] Initialize NestJS project in `apps/backend`
- [ ] Configure TypeORM with PostgreSQL
- [ ] Set up local Docker Compose (PostgreSQL + Redis)
- [ ] Configure environment variables
- [ ] Set up Swagger/OpenAPI documentation

#### 1.2 Database Schema
- [ ] Create migrations for core tables:
  - `teams` table
  - `projects` table
  - `snapshots` table
  - `static_metrics` table
  - `ai_reports` table
  - `final_scores` table
  - `manual_overrides` table
- [ ] Create TypeORM entities for all tables
- [ ] Add indexes for performance
- [ ] Create seed data for development

#### 1.3 Authentication Module
- [ ] Implement JWT strategy
- [ ] Create `auth` module with:
  - Team registration endpoint
  - Token generation endpoint
  - Token validation middleware
- [ ] Implement guards (JwtAuthGuard, RolesGuard)
- [ ] Add rate limiting

#### 1.4 Teams Module
- [ ] Create CRUD endpoints for teams
- [ ] Implement team validation
- [ ] Add team authentication
- [ ] POST `/api/teams` - Register team
- [ ] GET `/api/teams/:id` - Get team details

#### 1.5 Projects Module
- [ ] Create project entity and service
- [ ] Implement project creation linked to teams
- [ ] POST `/api/projects` - Create project
- [ ] GET `/api/projects/:id` - Get project details

#### 1.6 Snapshots Module
- [ ] Create snapshot entity and service
- [ ] Implement S3 upload service
- [ ] Implement hash validation (deduplicate)
- [ ] POST `/api/snapshots` - Upload snapshot
  - Receive snapshot metadata
  - Validate hash
  - Store metadata in PostgreSQL
  - Upload files to S3
  - Return upload confirmation
- [ ] GET `/api/snapshots/:id` - Get snapshot details

#### 1.7 AWS S3 Integration
- [ ] Configure AWS SDK
- [ ] Create S3 bucket (via Terraform or manually for dev)
- [ ] Implement S3UploadService:
  - Upload compressed snapshot files
  - Generate presigned URLs for retrieval
  - Handle upload errors and retries

#### 1.8 Testing
- [ ] Unit tests for services
- [ ] Integration tests with test database
- [ ] E2E tests for API endpoints
- [ ] Test snapshot upload flow end-to-end

### Deliverables
✅ Backend API running locally with PostgreSQL  
✅ Teams can register and authenticate  
✅ Snapshots can be uploaded and stored in S3  
✅ API documentation available via Swagger  

### Success Criteria
- All endpoints tested and documented
- Can create team, project, and upload snapshot via Postman/curl
- Database migrations run successfully
- S3 uploads work correctly

---

## ⚙️ Phase 2: Evaluation Worker - Static Analysis (Week 4)

### Goals
- Build evaluation worker service
- Implement SQS queue integration
- Develop static analysis pipeline

### Tasks

#### 2.1 Worker Service Bootstrap
- [ ] Initialize NestJS worker project in `apps/worker`
- [ ] Configure connection to PostgreSQL and Redis
- [ ] Set up AWS SQS client
- [ ] Configure environment variables
- [ ] Add structured logging

#### 2.2 SQS Integration
- [ ] Backend: Implement SQS publisher service
  - Publish evaluation job on snapshot upload
  - Include snapshot_id and s3_path
- [ ] Worker: Implement SQS consumer service
  - Poll for messages
  - Process messages with concurrency limit (10-15)
  - Handle visibility timeout and retries
  - Implement dead-letter queue

#### 2.3 Evaluation Orchestrator
- [ ] Create `EvaluationOrchestrator` service:
  - Retrieve snapshot from S3
  - Extract files
  - Run static analysis
  - Store results in database
  - Update processing status

#### 2.4 Static Analysis Services

##### Lint Analyzer
- [ ] Implement ESLint integration
- [ ] Run linting on JavaScript/TypeScript files
- [ ] Calculate lint score (based on errors/warnings)
- [ ] Store results

##### Complexity Analyzer
- [ ] Integrate `complexity-report` or similar
- [ ] Analyze cyclomatic complexity
- [ ] Calculate complexity score
- [ ] Flag functions with high complexity

##### Security Scanner
- [ ] Integrate `npm audit` or `snyk`
- [ ] Scan dependencies for vulnerabilities
- [ ] Calculate security score
- [ ] Flag critical vulnerabilities

##### Test Coverage Analyzer
- [ ] Parse test files (Jest, Mocha patterns)
- [ ] Calculate test coverage estimate
- [ ] Analyze test quality (assertions, mocks)
- [ ] Calculate test score

##### Build Status Checker
- [ ] Detect build configuration (package.json scripts)
- [ ] Attempt build (sandbox environment)
- [ ] Calculate build score (success/failure)

##### Code Structure Analyzer
- [ ] Analyze directory structure
- [ ] Check for best practices (separation of concerns)
- [ ] Validate architecture patterns
- [ ] Calculate structure score

#### 2.5 Static Metrics Storage
- [ ] Store metrics in `static_metrics` table:
  - lint_score
  - complexity_score
  - security_score
  - test_score
  - structure_score
  - build_score
- [ ] Calculate aggregate static score (weighted average)

#### 2.6 Testing
- [ ] Unit tests for each analyzer
- [ ] Integration tests with sample codebases
- [ ] Test SQS message processing
- [ ] Test error handling and retries

### Deliverables
✅ Worker service consuming SQS queue  
✅ Static analysis running on uploaded snapshots  
✅ Static metrics stored in database  
✅ Error handling and retry logic working  

### Success Criteria
- Upload snapshot → job queued → static analysis runs → results stored
- All static analyzers produce valid scores
- Concurrent processing works (10-15 jobs)
- Failed jobs retry correctly

---

## 🤖 Phase 3: AI Evaluation & Scoring Engine (Week 5)

### Goals
- Integrate LLM for subjective evaluation
- Implement scoring engine
- Build cheat detection system

### Tasks

#### 3.1 LLM Integration

##### LLM Client Service
- [ ] Choose LLM provider (OpenAI GPT-4, Anthropic Claude)
- [ ] Implement LLMClientService with:
  - API authentication
  - Rate limiting
  - Retry logic with exponential backoff
  - Error handling
  - Cost tracking

##### Prompt Builder
- [ ] Create prompt templates
- [ ] Implement PromptBuilderService:
  - Include problem statement
  - Include static metrics summary
  - Include architecture overview
  - Include key file summaries (token-optimized)
  - Format for structured JSON response

##### Response Validator
- [ ] Implement response validation
- [ ] Ensure JSON schema compliance
- [ ] Validate score ranges (0-100)
- [ ] Handle malformed responses

#### 3.2 AI Evaluator Service
- [ ] Integrate into orchestrator
- [ ] Run after static analysis completes
- [ ] Call LLM with structured prompt
- [ ] Parse and validate response
- [ ] Store in `ai_reports` table:
  - innovation_score
  - architecture_score
  - scalability_score
  - alignment_score
  - readability_score
  - documentation_score
  - feedback (text)
  - risk_flags (array)

#### 3.3 Scoring Engine
- [ ] Implement ScoreCalculatorService:
  - Calculate final score: `(static_score * 0.6) + (ai_score * 0.4)`
  - Store breakdown in `final_scores` table
  - Include timestamp
- [ ] Implement weighted scoring logic
- [ ] Add configurable weight adjustments

#### 3.4 Leaderboard Service
- [ ] Implement Redis sorted set for leaderboard
- [ ] Update leaderboard on score calculation
- [ ] Implement LeaderboardService:
  - `updateScore(projectId, score)`
  - `getTopN(n)` - Get top N teams
  - `getRankByProject(projectId)`
  - `getScoreBreakdown(projectId)`

#### 3.5 Cheat Detection
- [ ] Implement AnomalyDetectorService:
  - **LOC spike detection**: Flag sudden large increases
  - **Growth analyzer**: Check for incremental growth
  - **Similarity checker**: Compare file hashes across teams
- [ ] Store flags in `ai_reports.risk_flags`
- [ ] Don't block submissions, just flag

#### 3.6 Testing
- [ ] Unit tests for LLM client (mocked responses)
- [ ] Integration tests with test prompts
- [ ] Test scoring calculation accuracy
- [ ] Test cheat detection algorithms
- [ ] End-to-end evaluation test (snapshot → final score)

### Deliverables
✅ LLM evaluation integrated  
✅ Final scores calculated and stored  
✅ Leaderboard updated in Redis  
✅ Cheat detection active  

### Success Criteria
- Complete evaluation pipeline works (static → AI → scoring)
- Scores are explainable and reproducible
- Leaderboard updates in real-time
- Anomalies are flagged correctly

---

## 🎨 Phase 4: Admin Dashboard (Week 6-7)

### Goals
- Build Next.js dashboard
- Implement real-time leaderboard
- Create admin and judge interfaces

### Tasks

#### 4.1 Dashboard Bootstrap
- [ ] Initialize Next.js 14 project in `apps/dashboard`
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui components
- [ ] Set up app router structure
- [ ] Configure environment variables

#### 4.2 Authentication
- [ ] Implement login page
- [ ] Integrate with backend JWT
- [ ] Create AuthContext for state management
- [ ] Implement protected routes
- [ ] Add role-based access (admin/judge)

#### 4.3 API Client
- [ ] Create API client wrapper (axios)
- [ ] Implement endpoints:
  - `GET /api/leaderboard`
  - `GET /api/teams`
  - `GET /api/teams/:id`
  - `GET /api/evaluations/:projectId`
  - `POST /api/overrides` (manual score adjustment)
- [ ] Add error handling and retry logic
- [ ] Implement SWR or TanStack Query for caching

#### 4.4 WebSocket Integration
- [ ] Backend: Implement WebSocket gateway (Socket.IO)
  - Emit on score updates
  - Emit on new submissions
- [ ] Dashboard: Implement WebSocket client
  - Connect on dashboard load
  - Listen for leaderboard updates
  - Auto-refresh affected components

#### 4.5 Admin Dashboard Pages

##### Dashboard Home (`/dashboard`)
- [ ] Overview cards:
  - Total teams
  - Submissions today
  - Average score
  - Evaluations pending
- [ ] Recent activity feed
- [ ] Quick actions

##### Live Leaderboard (`/leaderboard`)
- [ ] Real-time leaderboard table:
  - Rank
  - Team name
  - Total score
  - Last update time
  - Progress indicator
- [ ] Implement auto-refresh via WebSocket
- [ ] Add filters (top 20, all teams)
- [ ] Add search functionality

##### Team Details (`/teams/:id`)
- [ ] Team information card
- [ ] Project details
- [ ] Snapshot timeline (all submissions)
- [ ] Score breakdown:
  - Static metrics (bar chart)
  - AI scores (radar chart)
  - Final score (gauge)
- [ ] AI feedback panel
- [ ] Risk flags display
- [ ] Manual override slider (admin only)

##### Evaluations List (`/evaluations`)
- [ ] Table of all evaluations:
  - Team name
  - Submission time
  - Status (pending/completed/failed)
  - Score
  - Actions (view details)
- [ ] Filters (status, date range)
- [ ] Pagination

##### Settings (`/settings`)
- [ ] Scoring weight configuration
- [ ] Evaluation settings
- [ ] Hackathon metadata

#### 4.6 Judge Interface

##### Shortlist (`/judge/shortlist`)
- [ ] Top 20 teams table
- [ ] Quick comparison view
- [ ] Export to CSV

##### Side-by-Side Compare (`/judge/compare`)
- [ ] Select 2-4 teams
- [ ] Side-by-side comparison:
  - Score breakdowns
  - AI feedback
  - Snapshot timelines
  - Code snippets (if needed)
- [ ] Add judge notes
- [ ] Submit final rankings

#### 4.7 UI Components
- [ ] LeaderboardTable component
- [ ] ScoreBreakdown component
- [ ] ProgressChart component (Recharts)
- [ ] AIFeedbackPanel component
- [ ] RiskFlagsList component
- [ ] SnapshotTimeline component
- [ ] ScoreOverrideSlider component
- [ ] LoadingSpinner, ErrorBoundary

#### 4.8 Testing
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright):
  - Login flow
  - Leaderboard navigation
  - Team details view
  - Manual override
- [ ] Visual regression tests (optional)

### Deliverables
✅ Functional admin dashboard  
✅ Real-time leaderboard  
✅ Team evaluation details view  
✅ Judge shortlist and comparison tools  

### Success Criteria
- Dashboard loads and displays leaderboard
- Real-time updates work via WebSocket
- Judges can view top 20 and compare teams
- Admins can manually override scores
- Mobile responsive

---

## 🔌 Phase 5: VS Code Extension (Week 8-9)

### Goals
- Build fully functional VS Code extension
- Implement auto-snapshot with scheduling
- Enable team authentication
- Support manual submission

### Tasks

#### 5.1 Extension Bootstrap
- [ ] Initialize VS Code extension project in `apps/vscode-extension`
- [ ] Configure `package.json` with extension manifest:
  - Activation events
  - Commands
  - Configuration options
  - Required VS Code version
- [ ] Set up esbuild for bundling
- [ ] Configure `.vscodeignore`

#### 5.2 Auth Module
- [ ] Implement command: "VisionX: Authenticate"
- [ ] Create webview for team ID input
- [ ] Call backend `/auth/validate` endpoint
- [ ] Store JWT token in workspace state
- [ ] Store team ID and project ID
- [ ] Display status in status bar

#### 5.3 Workspace Scanner
- [ ] Implement on extension activation:
  - Detect workspace root
  - Check for `.git` folder (initialize if missing)
  - Detect tech stack (package.json, requirements.txt, pom.xml, etc.)
  - Build file tree (respecting .gitignore)
  - Calculate LOC by language
  - Parse dependency list
  - Get commit stats (latest commit, author, message)
- [ ] Implement tech stack detector for:
  - JavaScript/TypeScript (package.json, node_modules)
  - Python (requirements.txt, setup.py)
  - Java (pom.xml, build.gradle)
  - Go (go.mod)
  - Others (detect by file extensions)

#### 5.4 Snapshot Engine
- [ ] Implement SnapshotEngine service:
  - Generate project hash (based on file contents)
  - Collect snapshot data:
    ```typescript
    {
      teamId,
      projectId,
      timestamp,
      projectHash,
      techStack,
      fileTree,
      locByLanguage,
      dependencyList,
      commitStats,
      changedFiles[]
    }
    ```
  - Filter out ignored files (node_modules, dist, .git, etc.)
  - Include only changed files (compare with last snapshot)
  - Compress payload (gzip)

#### 5.5 Diff Engine
- [ ] Implement DiffEngine:
  - Store last snapshot hash in workspace state
  - Compare current hash with last hash
  - Skip upload if hash unchanged
  - Include only changed files in snapshot
  - Calculate LOC delta

#### 5.6 Snapshot Scheduler
- [ ] Implement auto-snapshot every 45 minutes
- [ ] Start timer on authentication
- [ ] Show countdown in status bar
- [ ] Pause/resume functionality
- [ ] Stop on final submission

#### 5.7 Uploader Module
- [ ] Implement API client:
  - POST snapshot to `/api/snapshots`
  - Include JWT token in headers
  - Handle compressed payload
  - Retry on failure (3 attempts)
  - Show upload progress
- [ ] Implement RetryManager:
  - Exponential backoff
  - Store failed uploads for retry
  - Alert user on persistent failures

#### 5.8 Commands
- [ ] **VisionX: Authenticate** - Team login
- [ ] **VisionX: Evaluate Now** - Manual snapshot trigger
- [ ] **VisionX: Final Submission** - Lock and submit final
- [ ] **VisionX: View Status** - Show current status webview
- [ ] **VisionX: Pause Auto-Snapshot** - Pause scheduler
- [ ] **VisionX: Resume Auto-Snapshot** - Resume scheduler

#### 5.9 Status Bar & Notifications
- [ ] Status bar item showing:
  - Authentication status
  - Next snapshot countdown
  - Last upload status
- [ ] Notifications:
  - Snapshot uploaded successfully
  - Upload failed (with retry option)
  - Final submission confirmed
  - Lock activated (no more uploads)

#### 5.10 Submission Lock
- [ ] Implement lock mechanism:
  - Triggered by final submission command
  - Disable all future snapshots
  - Store lock state in workspace
  - Show "Locked" in status bar
  - Prevent unlock by user

#### 5.11 Webview UI
- [ ] Create status webview showing:
  - Team info
  - Project info
  - Snapshot history
  - Last evaluation score (if available)
  - Next snapshot countdown

#### 5.12 Testing
- [ ] Unit tests for modules
- [ ] Integration tests with mock backend
- [ ] E2E tests with test workspace:
  - Authentication flow
  - Auto-snapshot trigger
  - Manual snapshot
  - Final submission
  - Lock verification

#### 5.13 Packaging
- [ ] Create extension package with `vsce`
- [ ] Test installation locally
- [ ] Create installation guide

### Deliverables
✅ Functional VS Code extension  
✅ Auto-snapshot every 45 minutes  
✅ Manual evaluation on demand  
✅ Final submission with lock  
✅ Extension packaged and ready  

### Success Criteria
- Extension can be installed and activated
- Teams can authenticate
- Snapshots upload successfully to backend
- Auto-snapshot works reliably
- Final submission locks extension
- Clear user feedback at all stages

---

## ☁️ Phase 6: AWS Deployment & Production (Week 10-11)

### Goals
- Deploy all services to AWS
- Set up production infrastructure
- Configure CI/CD pipelines
- Enable monitoring and alerts

### Tasks

#### 6.1 Infrastructure as Code (Terraform)

##### VPC & Networking
- [ ] Create VPC with public and private subnets
- [ ] Set up Internet Gateway
- [ ] Configure NAT Gateway for private subnets
- [ ] Set up route tables
- [ ] Configure security groups:
  - ALB (public, ports 80/443)
  - ECS tasks (private, specific ports)
  - RDS (private, port 5432)
  - ElastiCache (private, port 6379)

##### RDS PostgreSQL
- [ ] Create RDS PostgreSQL instance (db.t3.medium for start)
- [ ] Multi-AZ deployment (for prod)
- [ ] Automated backups
- [ ] Encryption at rest
- [ ] Parameter group for performance tuning

##### ElastiCache Redis
- [ ] Create Redis cluster (cache.t3.small)
- [ ] Cluster mode enabled (optional)
- [ ] Encryption in transit and at rest

##### S3 Buckets
- [ ] Create snapshot storage bucket
- [ ] Enable versioning
- [ ] Configure lifecycle policies (archive old snapshots)
- [ ] Enable server-side encryption
- [ ] Set up bucket policies (restrict access to ECS tasks)

##### SQS
- [ ] Create evaluation job queue
- [ ] Create dead-letter queue
- [ ] Set visibility timeout (15 minutes)
- [ ] Set message retention (7 days)

##### ECS Fargate
- [ ] Create ECS cluster
- [ ] Task definitions for:
  - Backend API service
  - Worker service
  - Dashboard (Next.js)
- [ ] Service definitions:
  - Desired count, min/max
  - Health checks
  - Auto-scaling policies
  - Load balancer integration

##### Application Load Balancer
- [ ] Create ALB
- [ ] Configure target groups:
  - Backend API
  - Dashboard
- [ ] Configure listeners (HTTPS, redirect HTTP to HTTPS)
- [ ] Request ACM certificate for custom domain
- [ ] Set up domain in Route 53

##### IAM Roles & Policies
- [ ] ECS task execution role
- [ ] ECS task role with permissions for:
  - S3 read/write
  - SQS send/receive
  - RDS connect
  - ElastiCache connect
  - Secrets Manager access

##### Secrets Manager
- [ ] Store sensitive config:
  - Database credentials
  - JWT secret
  - LLM API keys
  - AWS credentials

#### 6.2 Docker & Container Setup
- [ ] Create Dockerfiles for:
  - Backend API (`apps/backend/Dockerfile`)
  - Worker (`apps/worker/Dockerfile`)
  - Dashboard (`apps/dashboard/Dockerfile`)
- [ ] Optimize Docker images (multi-stage builds)
- [ ] Push images to Amazon ECR

#### 6.3 CI/CD Pipelines (GitHub Actions)

##### Backend Pipeline (`.github/workflows/backend.yml`)
- [ ] On push to `main`:
  - Run tests
  - Build Docker image
  - Push to ECR
  - Deploy to ECS (rolling update)
  - Run smoke tests
- [ ] On pull request:
  - Run linting and tests

##### Worker Pipeline (`.github/workflows/worker.yml`)
- [ ] Similar to backend pipeline

##### Dashboard Pipeline (`.github/workflows/dashboard.yml`)
- [ ] Build Next.js app
- [ ] Push Docker image to ECR
- [ ] Deploy to ECS

##### Extension Pipeline (`.github/workflows/extension.yml`)
- [ ] On release tag:
  - Build extension
  - Package with `vsce`
  - Upload artifact to GitHub release

#### 6.4 Database Migrations
- [ ] Run TypeORM migrations on RDS
- [ ] Set up migration job in CI/CD
- [ ] Create backup before migration

#### 6.5 Monitoring & Logging

##### CloudWatch
- [ ] Set up log groups for:
  - Backend API logs
  - Worker logs
  - Dashboard logs
- [ ] Set retention policies (30 days)
- [ ] Create custom metrics:
  - Request count
  - Error rate
  - Snapshot upload count
  - Evaluation processing time
  - LLM API latency and cost

##### CloudWatch Alarms
- [ ] High error rate alert
- [ ] SQS queue depth > threshold
- [ ] RDS connection failures
- [ ] ECS service unhealthy
- [ ] S3 upload failures
- [ ] LLM API rate limit hit

##### X-Ray (Distributed Tracing)
- [ ] Enable X-Ray for ECS tasks
- [ ] Trace requests through services
- [ ] Identify bottlenecks

##### Dashboards
- [ ] Create CloudWatch dashboard with:
  - API request metrics
  - Evaluation processing metrics
  - Database performance
  - Queue metrics
  - LLM costs

#### 6.6 Load Testing
- [ ] Set up k6 or Artillery
- [ ] Simulate 300 teams submitting snapshots hourly
- [ ] Test peak load (all teams submit at once)
- [ ] Measure:
  - API response times
  - Worker processing times
  - Database performance
  - Redis performance
- [ ] Tune auto-scaling policies based on results

#### 6.7 Security Hardening
- [ ] Enable AWS WAF on ALB
- [ ] Set up rate limiting rules
- [ ] Enable GuardDuty for threat detection
- [ ] Run security scan on Docker images
- [ ] Review IAM policies (least privilege)
- [ ] Enable VPC Flow Logs

#### 6.8 Documentation
- [ ] Write deployment guide (`docs/deployment/aws-setup.md`)
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document rollback procedure
- [ ] Create disaster recovery plan

#### 6.9 Final Testing
- [ ] End-to-end test in production environment
- [ ] Verify extension → backend → worker → dashboard flow
- [ ] Test WebSocket updates
- [ ] Test manual overrides
- [ ] Verify all monitoring and alerts work

### Deliverables
✅ All services deployed to AWS  
✅ Production infrastructure fully provisioned  
✅ CI/CD pipelines operational  
✅ Monitoring and alerting active  
✅ Load testing completed and tuned  

### Success Criteria
- System handles 300 teams with hourly snapshots
- All services auto-scale correctly
- Monitoring dashboards show healthy metrics
- Alerts fire correctly on issues
- End-to-end flow works in production
- Documentation complete

---

## 📊 Post-Launch: Phase 7 (Continuous Improvement)

### Week 12+

#### Observability Enhancements
- [ ] Add detailed performance monitoring
- [ ] Track LLM cost per evaluation
- [ ] Monitor user engagement in extension
- [ ] Create weekly usage reports

#### Feature Enhancements
- [ ] Extension: Add project progress graph
- [ ] Dashboard: Export full evaluation report as PDF
- [ ] Backend: Add evaluation templates for different hackathon themes
- [ ] Worker: Fine-tune LLM prompts based on feedback

#### Optimization
- [ ] Reduce LLM API costs (optimize prompts)
- [ ] Improve static analysis performance
- [ ] Cache common analysis results
- [ ] Optimize database queries

#### Bug Fixes & Support
- [ ] Monitor error tracking (Sentry)
- [ ] Address user-reported issues
- [ ] Improve error messages in extension
- [ ] Add troubleshooting guides

---

## 🎯 Summary Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| 0 | 1 week | Project setup |
| 1 | 2 weeks | Backend API |
| 2 | 1 week | Worker + Static Analysis |
| 3 | 1 week | AI + Scoring |
| 4 | 2 weeks | Dashboard |
| 5 | 2 weeks | VS Code Extension |
| 6 | 2 weeks | AWS Deployment |
| **Total** | **11 weeks** | **MVP Launch** |

---

## ✅ Success Metrics

### Technical
- ✅ 300 teams can submit snapshots hourly
- ✅ Evaluation completes within 5 minutes per snapshot
- ✅ API response time < 200ms (p95)
- ✅ Worker processes 10-15 jobs concurrently
- ✅ Zero data loss on failures
- ✅ 99.5% uptime

### Business
- ✅ Reduces manual judging time by 80%
- ✅ Fair and transparent scoring
- ✅ Cheat detection catches anomalies
- ✅ Judges can shortlist top 20 teams quickly
- ✅ Real-time leaderboard engages participants

---

**Next Step**: Start Phase 0 and set up the monorepo structure!
