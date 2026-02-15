# ✅ Master Development Checklist

Track your progress through all phases of VisionX Eval development.

---

## 📋 Phase 0: Project Setup & Foundation

**Goal**: Set up monorepo, shared utilities, and development environment  
**Duration**: 1 week  
**Status**: 🟡 Not Started

### Repository Setup
- [ ] Initialize monorepo with pnpm workspaces
- [ ] Create complete folder structure (apps/, packages/, infrastructure/, docs/)
- [ ] Configure root `package.json` with workspace configuration
- [ ] Set up `.gitignore` (node_modules, .env, dist, etc.)
- [ ] Create `.env.example` files

### Shared Package (`packages/shared`)
- [ ] Initialize TypeScript project
- [ ] Define core types:
  - [ ] `types/snapshot.ts` - Snapshot interface
  - [ ] `types/evaluation.ts` - Evaluation result types
  - [ ] `types/team.ts` - Team and project types
  - [ ] `types/scoring.ts` - Score breakdown types
- [ ] Implement shared utilities:
  - [ ] `utils/hash.ts` - Project hash generation
  - [ ] `utils/compression.ts` - Payload compression
  - [ ] `utils/validation.ts` - Input validation helpers
- [ ] Create constants:
  - [ ] `constants/scoring.ts` - Scoring weights
  - [ ] `constants/languages.ts` - Supported languages
  - [ ] `constants/analysis.ts` - Analysis thresholds
- [ ] Test build and ensure it compiles

### Development Tools
- [ ] Configure ESLint (shared config in `packages/eslint-config`)
- [ ] Configure Prettier
- [ ] Set up Husky git hooks (pre-commit linting)
- [ ] Configure VS Code workspace settings
- [ ] Create `scripts/setup.sh` for initial environment setup
- [ ] Create `scripts/clean.sh` for cleanup
- [ ] Create `scripts/test-all.sh` for running all tests
- [ ] Create `scripts/build-all.sh` for building all packages

### Documentation
- [ ] Create comprehensive `README.md` with project overview
- [ ] Write `docs/development/setup-guide.md`
- [ ] Write `docs/development/coding-standards.md`
- [ ] Create PR template (`.github/pull_request_template.md`)
- [ ] Create issue templates (`.github/ISSUE_TEMPLATE/`)

### CI/CD Foundation
- [ ] Set up GitHub Actions workflows:
  - [ ] `.github/workflows/lint.yml` - Linting on PRs
  - [ ] `.github/workflows/test.yml` - Testing on PRs
- [ ] Configure branch protection rules (main, develop)
- [ ] Set up auto-assign reviewers

### Docker & Local Development
- [ ] Create `docker-compose.yml` (PostgreSQL + Redis)
- [ ] Test Docker services start successfully
- [ ] Document local development setup

### Git & Version Control
- [ ] Initialize Git repository
- [ ] Make initial commit
- [ ] Create `develop` branch
- [ ] Push to remote repository

---

## 📦 Phase 1: Backend API Foundation

**Goal**: Build NestJS backend with database and core API endpoints  
**Duration**: 2 weeks  
**Status**: 🔴 Not Started

### Backend Bootstrap
- [ ] Initialize NestJS project in `apps/backend`
- [ ] Configure TypeORM with PostgreSQL
- [ ] Set up local development with Docker Compose
- [ ] Configure environment variables (`.env`)
- [ ] Set up Swagger/OpenAPI documentation
- [ ] Configure logging (Winston or built-in)

### Database Schema & Migrations
- [ ] Create migration: `teams` table
- [ ] Create migration: `projects` table
- [ ] Create migration: `snapshots` table
- [ ] Create migration: `static_metrics` table
- [ ] Create migration: `ai_reports` table
- [ ] Create migration: `final_scores` table
- [ ] Create migration: `manual_overrides` table
- [ ] Create TypeORM entities for all tables
- [ ] Add appropriate indexes
- [ ] Create seed data for development/testing
- [ ] Test migrations (run up and down)

### Authentication Module
- [ ] Create `auth` module
- [ ] Implement JWT strategy with Passport
- [ ] Create team registration endpoint: `POST /auth/register`
- [ ] Create token generation endpoint: `POST /auth/login`
- [ ] Implement `JwtAuthGuard`
- [ ] Implement `RolesGuard` (for admin/judge roles)
- [ ] Add rate limiting middleware
- [ ] Add input validation (class-validator)
- [ ] Write unit tests for auth service
- [ ] Write E2E tests for auth endpoints

### Teams Module
- [ ] Create `teams` module with controller, service, entity
- [ ] Implement `POST /api/teams` - Register team
- [ ] Implement `GET /api/teams/:id` - Get team details
- [ ] Implement `GET /api/teams` - List teams (admin only)
- [ ] Add validation for team creation
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Document endpoints in Swagger

### Projects Module
- [ ] Create `projects` module with controller, service, entity
- [ ] Implement `POST /api/projects` - Create project
- [ ] Implement `GET /api/projects/:id` - Get project details
- [ ] Implement `GET /api/projects?teamId=xxx` - Get projects by team
- [ ] Link projects to teams (foreign key)
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Document endpoints in Swagger

### Snapshots Module
- [ ] Create `snapshots` module with controller, service, entity
- [ ] Implement `POST /api/snapshots` - Upload snapshot
  - [ ] Validate JWT token
  - [ ] Check hash for duplicates
  - [ ] Parse and validate snapshot payload
  - [ ] Store metadata in PostgreSQL
  - [ ] Upload files to S3 (implement S3 service)
  - [ ] Return upload confirmation
- [ ] Implement `GET /api/snapshots/:id` - Get snapshot details
- [ ] Implement `GET /api/snapshots?projectId=xxx` - Get snapshots by project
- [ ] Create `S3UploadService`:
  - [ ] Configure AWS SDK
  - [ ] Implement upload to S3
  - [ ] Generate presigned URLs
  - [ ] Handle upload errors
- [ ] Create `HashValidatorService` (check for duplicates)
- [ ] Write unit tests
- [ ] Write integration tests with test S3 bucket
- [ ] Write E2E tests
- [ ] Document endpoints in Swagger

### AWS S3 Integration
- [ ] Install AWS SDK (`@aws-sdk/client-s3`)
- [ ] Configure S3 credentials (env variables or IAM role)
- [ ] Create development S3 bucket (manual or script)
- [ ] Implement S3 upload with retry logic
- [ ] Test file upload and retrieval
- [ ] Add error handling for S3 operations

### Testing & Documentation
- [ ] Achieve >80% code coverage
- [ ] All endpoints tested (unit + E2E)
- [ ] Swagger documentation complete
- [ ] Create Postman/Thunder Client collection for manual testing
- [ ] Document environment variables in `README.md`

---

## ⚙️ Phase 2: Evaluation Worker - Static Analysis

**Goal**: Build worker service with SQS integration and static analysis pipeline  
**Duration**: 1 week  
**Status**: 🔴 Not Started

### Worker Service Bootstrap
- [ ] Initialize NestJS project in `apps/worker`
- [ ] Configure TypeORM connection (shared DB with backend)
- [ ] Configure Redis connection
- [ ] Set up AWS SQS client
- [ ] Configure environment variables
- [ ] Add structured logging

### SQS Integration
**Backend Side:**
- [ ] Install SQS SDK in backend
- [ ] Create `SQSPublisherService` in snapshots module
- [ ] Publish message to queue on snapshot upload
- [ ] Include `snapshot_id`, `s3_path`, `project_id` in message
- [ ] Handle publish errors with retry

**Worker Side:**
- [ ] Create `SQSConsumerService`
- [ ] Implement polling mechanism (long polling)
- [ ] Set concurrency limit (10-15 concurrent jobs)
- [ ] Handle visibility timeout correctly
- [ ] Implement message deletion on successful processing
- [ ] Set up dead-letter queue for failed jobs
- [ ] Add retry logic with exponential backoff

### Evaluation Orchestrator
- [ ] Create `EvaluationOrchestrator` service
- [ ] Orchestrate the evaluation flow:
  - [ ] Retrieve snapshot metadata from DB
  - [ ] Retrieve files from S3
  - [ ] Extract and prepare files
  - [ ] Run static analysis
  - [ ] Store static metrics in DB
  - [ ] Update snapshot processing status
- [ ] Handle errors gracefully
- [ ] Log each step for observability

### Static Analysis Services

#### Lint Analyzer
- [ ] Install ESLint as dependency
- [ ] Create `LintAnalyzer` service
- [ ] Run ESLint on JavaScript/TypeScript files
- [ ] Parse results (errors, warnings)
- [ ] Calculate lint score (normalize to 0-100)
- [ ] Store results
- [ ] Write unit tests with sample codebases

#### Complexity Analyzer
- [ ] Install complexity analysis tool (e.g., `escomplex`, `complexity-report`)
- [ ] Create `ComplexityAnalyzer` service
- [ ] Analyze cyclomatic complexity
- [ ] Calculate complexity score
- [ ] Flag functions with high complexity (>10)
- [ ] Write unit tests

#### Security Scanner
- [ ] Install security scanner (e.g., `npm audit`, `snyk`)
- [ ] Create `SecurityScanner` service
- [ ] Scan dependencies for vulnerabilities
- [ ] Parse severity levels (critical, high, medium, low)
- [ ] Calculate security score
- [ ] Flag critical vulnerabilities
- [ ] Write unit tests

#### Test Coverage Analyzer
- [ ] Create `TestCoverageAnalyzer` service
- [ ] Detect test files (Jest, Mocha, etc. patterns)
- [ ] Estimate test coverage (file count, assertions)
- [ ] Calculate test score
- [ ] Write unit tests

#### Build Status Checker
- [ ] Create `BuildChecker` service
- [ ] Detect build configuration (package.json, etc.)
- [ ] Attempt build in sandboxed environment (optional)
- [ ] Calculate build score (binary: success/failure)
- [ ] Write unit tests

#### Code Structure Analyzer
- [ ] Create `StructureAnalyzer` service
- [ ] Analyze directory structure
- [ ] Check for best practices (e.g., separation of concerns)
- [ ] Validate architecture patterns
- [ ] Calculate structure score
- [ ] Write unit tests

### Static Metrics Storage
- [ ] Store all metrics in `static_metrics` table
- [ ] Calculate aggregate static score (weighted average)
- [ ] Link to snapshot
- [ ] Write integration test (full static analysis flow)

### Testing
- [ ] Unit tests for each analyzer (>80% coverage)
- [ ] Integration tests with sample codebases
- [ ] Test SQS message consumption
- [ ] Test error handling and retries
- [ ] Test DLQ handling

---

## 🤖 Phase 3: AI Evaluation & Scoring Engine

**Goal**: Integrate LLM for evaluation, implement scoring, and enable cheat detection  
**Duration**: 1 week  
**Status**: 🔴 Not Started

### LLM Integration

#### LLM Client Service
- [ ] Choose LLM provider (OpenAI GPT-4, Anthropic Claude, or both)
- [ ] Install SDK (`openai`, `@anthropic-ai/sdk`)
- [ ] Create `LLMClientService`
- [ ] Implement API authentication
- [ ] Add rate limiting (respect API limits)
- [ ] Implement retry logic with exponential backoff
- [ ] Handle errors (timeout, rate limit, invalid response)
- [ ] Track API costs (log token usage)
- [ ] Write unit tests with mocked responses

#### Prompt Builder
- [ ] Create `PromptBuilderService`
- [ ] Design prompt template for evaluation
- [ ] Include in prompt:
  - [ ] Problem statement
  - [ ] Static metrics summary
  - [ ] Architecture overview (from file tree)
  - [ ] Key file summaries (optimize for token count)
- [ ] Format prompt for structured JSON response
- [ ] Test prompt with sample data
- [ ] Iterate on prompt engineering for better results

#### Response Validator
- [ ] Create `ResponseValidatorService`
- [ ] Define JSON schema for LLM response
- [ ] Validate schema compliance
- [ ] Validate score ranges (0-100)
- [ ] Handle malformed responses (retry or default score)
- [ ] Write unit tests

### AI Evaluator Service
- [ ] Create `AIEvaluatorService`
- [ ] Integrate into `EvaluationOrchestrator` (run after static analysis)
- [ ] Build prompt using `PromptBuilderService`
- [ ] Call LLM via `LLMClientService`
- [ ] Validate response via `ResponseValidatorService`
- [ ] Parse AI scores:
  - [ ] innovation_score
  - [ ] architecture_score
  - [ ] scalability_score
  - [ ] alignment_score
  - [ ] readability_score
  - [ ] documentation_score
  - [ ] feedback (text)
  - [ ] risk_flags (array)
- [ ] Store in `ai_reports` table
- [ ] Write integration tests (with mocked LLM)

### Scoring Engine
- [ ] Create `ScoreCalculatorService`
- [ ] Implement scoring formula: `(static_score * 0.6) + (ai_score * 0.4)`
- [ ] Calculate weighted aggregate scores
- [ ] Store breakdown in `final_scores` table:
  - [ ] total_score
  - [ ] static_score
  - [ ] ai_score
  - [ ] last_updated timestamp
- [ ] Add configurable weight adjustments (for future tuning)
- [ ] Write unit tests for scoring calculations

### Leaderboard Service
- [ ] Create `LeaderboardService`
- [ ] Implement Redis sorted set operations:
  - [ ] `updateScore(projectId, score)` - Add/update score
  - [ ] `getTopN(n)` - Get top N teams
  - [ ] `getRankByProject(projectId)` - Get specific team rank
  - [ ] `getScoreBreakdown(projectId)` - Get detailed scores
- [ ] Update leaderboard immediately after score calculation
- [ ] Handle Redis connection failures gracefully
- [ ] Write integration tests (with test Redis instance)

### Cheat Detection
- [ ] Create `AnomalyDetectorService`
- [ ] Implement LOC spike detection:
  - [ ] Compare LOC with previous snapshots
  - [ ] Flag sudden large increases (>2x in one submission)
- [ ] Implement growth analyzer:
  - [ ] Check for incremental growth pattern
  - [ ] Flag projects with no incremental commits
- [ ] Implement similarity checker:
  - [ ] Compare file hashes across teams
  - [ ] Flag identical code blocks
- [ ] Store flags in `ai_reports.risk_flags`
- [ ] Don't block submissions, just flag for review
- [ ] Write unit tests for detection algorithms

### Testing
- [ ] Unit tests for all new services (>80% coverage)
- [ ] Integration test: complete evaluation pipeline (static → AI → scoring)
- [ ] Test with various codebase samples
- [ ] Validate scoring accuracy
- [ ] Test cheat detection with edge cases
- [ ] End-to-end test: snapshot upload → final score in DB and Redis

---

## 🎨 Phase 4: Admin Dashboard

**Goal**: Build Next.js dashboard with real-time leaderboard and admin tools  
**Duration**: 2 weeks  
**Status**: 🔴 Not Started

### Dashboard Bootstrap
- [ ] Initialize Next.js 14 project in `apps/dashboard`
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up app router structure (`src/app/`)
- [ ] Configure environment variables (`.env.local`)
- [ ] Set up TypeScript (`tsconfig.json`)

### Authentication
- [ ] Create login page (`/login`)
- [ ] Implement JWT authentication with backend
- [ ] Create `AuthContext` for global state
- [ ] Implement protected routes (middleware)
- [ ] Add role-based access (admin vs. judge)
- [ ] Store token in httpOnly cookie or localStorage
- [ ] Add logout functionality
- [ ] Handle token expiration and refresh

### API Client
- [ ] Create API client wrapper (Axios or Fetch)
- [ ] Implement endpoints:
  - [ ] `GET /api/leaderboard`
  - [ ] `GET /api/teams`
  - [ ] `GET /api/teams/:id`
  - [ ] `GET /api/projects/:id`
  - [ ] `GET /api/evaluations/:projectId`
  - [ ] `POST /api/overrides` (manual score adjustment)
- [ ] Add error handling
- [ ] Implement retry logic
- [ ] Set up SWR or TanStack Query for data caching

### WebSocket Integration
**Backend:**
- [ ] Install Socket.IO in backend
- [ ] Create WebSocket gateway in backend
- [ ] Emit events on:
  - [ ] Score updates
  - [ ] New submissions
  - [ ] Leaderboard changes

**Dashboard:**
- [ ] Install Socket.IO client
- [ ] Create WebSocket client wrapper
- [ ] Connect on dashboard load
- [ ] Listen for events and update UI
- [ ] Handle reconnection logic
- [ ] Add visual indicator for connection status

### Admin Dashboard Pages

#### Dashboard Home (`/dashboard`)
- [ ] Create layout with sidebar and header
- [ ] Implement overview cards:
  - [ ] Total teams
  - [ ] Submissions today
  - [ ] Average score
  - [ ] Evaluations pending
- [ ] Add recent activity feed
- [ ] Add quick actions (refresh, export, etc.)
- [ ] Test responsiveness

#### Live Leaderboard (`/leaderboard`)
- [ ] Create `LeaderboardTable` component
- [ ] Display columns:
  - [ ] Rank
  - [ ] Team name
  - [ ] Total score
  - [ ] Last update time
  - [ ] Progress indicator
- [ ] Implement auto-refresh via WebSocket
- [ ] Add filters:
  - [ ] Top 20 only
  - [ ] All teams
  - [ ] By status (active, submitted)
- [ ] Add search functionality (by team name)
- [ ] Add sorting (by score, name, time)
- [ ] Add pagination
- [ ] Test with sample data

#### Team Details (`/teams/:id`)
- [ ] Create team information card
- [ ] Display project details
- [ ] Implement `SnapshotTimeline` component (chronological list)
- [ ] Create `ScoreBreakdown` component:
  - [ ] Static metrics (bar chart)
  - [ ] AI scores (radar chart)
  - [ ] Final score (gauge or large number)
- [ ] Create `AIFeedbackPanel` component (display feedback text)
- [ ] Create `RiskFlagsList` component (display flags)
- [ ] Implement manual override slider (admin only):
  - [ ] Slider to adjust score
  - [ ] Reason input field
  - [ ] Submit button
  - [ ] Confirmation dialog
- [ ] Test all interactions

#### Evaluations List (`/evaluations`)
- [ ] Create table of all evaluations:
  - [ ] Team name
  - [ ] Submission time
  - [ ] Status (pending, completed, failed)
  - [ ] Score (if completed)
  - [ ] Actions (view details, retry if failed)
- [ ] Add filters:
  - [ ] By status
  - [ ] By date range
- [ ] Implement pagination
- [ ] Add export to CSV functionality
- [ ] Test filtering and sorting

#### Settings (`/settings`)
- [ ] Create settings page (admin only)
- [ ] Scoring weight configuration (adjust weights)
- [ ] Evaluation settings (enable/disable features)
- [ ] Hackathon metadata (theme, dates, etc.)
- [ ] Save and reload settings from backend

### Judge Interface

#### Shortlist (`/judge/shortlist`)
- [ ] Display top 20 teams in table
- [ ] Show quick stats for each team
- [ ] Add "Compare" button to select teams
- [ ] Implement export to CSV
- [ ] Test with sample data

#### Side-by-Side Compare (`/judge/compare`)
- [ ] Allow selecting 2-4 teams
- [ ] Display side-by-side comparison:
  - [ ] Score breakdowns (side by side)
  - [ ] AI feedback
  - [ ] Snapshot timelines
  - [ ] Code snippets (optional)
- [ ] Add judge notes input
- [ ] Implement "Submit Rankings" button (store in backend)
- [ ] Test comparison view

### UI Components
- [ ] Create shadcn/ui components:
  - [ ] Button, Card, Table, Input, Select, Dialog
- [ ] Create custom components:
  - [ ] `LeaderboardTable`
  - [ ] `ScoreBreakdown`
  - [ ] `ProgressChart` (using Recharts)
  - [ ] `AIFeedbackPanel`
  - [ ] `RiskFlagsList`
  - [ ] `SnapshotTimeline`
  - [ ] `ScoreOverrideSlider`
  - [ ] `LoadingSpinner`
  - [ ] `ErrorBoundary`
- [ ] Test each component individually

### Styling & Polish
- [ ] Apply consistent Tailwind styling
- [ ] Ensure mobile responsiveness
- [ ] Add loading states for all async operations
- [ ] Add error states with retry options
- [ ] Add empty states (no data)
- [ ] Implement toast notifications for actions
- [ ] Add dark mode (optional)

### Testing
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright):
  - [ ] Login flow
  - [ ] Leaderboard navigation
  - [ ] Team details view
  - [ ] Manual override submission
  - [ ] Judge comparison
- [ ] Test WebSocket updates
- [ ] Test with different screen sizes

---

## 🔌 Phase 5: VS Code Extension

**Goal**: Build functional VS Code extension with auto-snapshots and authentication  
**Duration**: 2 weeks  
**Status**: 🔴 Not Started

### Extension Bootstrap
- [ ] Initialize VS Code extension project in `apps/vscode-extension`
- [ ] Configure `package.json` extension manifest:
  - [ ] Set display name, description, publisher
  - [ ] Define activation events
  - [ ] Define commands
  - [ ] Define configuration options
  - [ ] Set required VS Code version
- [ ] Set up esbuild for bundling
- [ ] Configure `.vscodeignore`
- [ ] Set up TypeScript (`tsconfig.json`)

### Auth Module
- [ ] Create `AuthService`
- [ ] Implement command: "VisionX: Authenticate"
- [ ] Create webview for team ID input (HTML/CSS/JS)
- [ ] Call backend `/auth/validate` endpoint
- [ ] Store JWT token in workspace state (`context.workspaceState`)
- [ ] Store team ID and project ID
- [ ] Display authentication status in status bar
- [ ] Handle authentication errors
- [ ] Write tests for auth flow

### Workspace Scanner
- [ ] Create `WorkspaceScanner` service
- [ ] Implement on extension activation:
  - [ ] Detect workspace root
  - [ ] Check for `.git` folder (initialize if missing)
  - [ ] Detect tech stack:
    - [ ] JavaScript/TypeScript (package.json, tsconfig.json)
    - [ ] Python (requirements.txt, setup.py)
    - [ ] Java (pom.xml, build.gradle)
    - [ ] Go (go.mod)
    - [ ] Others (by file extensions)
  - [ ] Build file tree (recursively scan folders)
  - [ ] Respect `.gitignore` patterns
  - [ ] Calculate LOC by language
  - [ ] Parse dependency list
  - [ ] Get commit stats (using simple-git):
    - [ ] Latest commit hash, author, message
    - [ ] Total commit count
- [ ] Write tests with mock workspace

### Snapshot Engine
- [ ] Create `SnapshotEngine` service
- [ ] Implement snapshot data collection:
  - [ ] teamId, projectId, timestamp
  - [ ] projectHash (MD5 or SHA256 of file contents)
  - [ ] techStack
  - [ ] fileTree
  - [ ] locByLanguage
  - [ ] dependencyList
  - [ ] commitStats
  - [ ] changedFiles (only files changed since last snapshot)
- [ ] Filter out ignored patterns:
  - [ ] node_modules, dist, build, .git
  - [ ] Configurable ignore patterns
- [ ] Compress payload (gzip)
- [ ] Write tests

### Diff Engine
- [ ] Create `DiffEngine` service
- [ ] Store last snapshot hash in workspace state
- [ ] Compare current hash with last hash
- [ ] Skip upload if hash unchanged
- [ ] Include only changed files in snapshot
- [ ] Calculate LOC delta
- [ ] Write tests

### Snapshot Scheduler
- [ ] Create `SnapshotScheduler` service
- [ ] Implement auto-snapshot timer (45 minutes)
- [ ] Start timer on successful authentication
- [ ] Show countdown in status bar (e.g., "Next snapshot: 42:15")
- [ ] Trigger snapshot automatically
- [ ] Implement pause/resume functionality
- [ ] Stop scheduler on final submission
- [ ] Persist state across restarts
- [ ] Write tests

### Uploader Module
- [ ] Create `APIClient` service
- [ ] Implement `POST /api/snapshots`:
  - [ ] Include JWT token in headers
  - [ ] Send compressed payload
  - [ ] Handle success response
  - [ ] Handle errors (network, auth, validation)
- [ ] Implement `RetryManager`:
  - [ ] Retry failed uploads (3 attempts)
  - [ ] Exponential backoff
  - [ ] Store failed uploads for later retry
  - [ ] Alert user on persistent failures
- [ ] Show upload progress (optional: progress bar)
- [ ] Write tests with mocked API

### Commands
- [ ] Implement "VisionX: Authenticate" - Team login
- [ ] Implement "VisionX: Evaluate Now" - Manual snapshot trigger
- [ ] Implement "VisionX: Final Submission" - Lock and submit final
- [ ] Implement "VisionX: View Status" - Show status webview
- [ ] Implement "VisionX: Pause Auto-Snapshot"
- [ ] Implement "VisionX: Resume Auto-Snapshot"
- [ ] Register all commands in `package.json`
- [ ] Test each command

### Status Bar & Notifications
- [ ] Create status bar item showing:
  - [ ] Authentication status (icon + text)
  - [ ] Next snapshot countdown
  - [ ] Last upload status (success/failed)
- [ ] Implement notifications:
  - [ ] "Snapshot uploaded successfully"
  - [ ] "Upload failed" (with retry option)
  - [ ] "Final submission confirmed"
  - [ ] "Extension locked" (no more uploads)
- [ ] Handle notification clicks (e.g., retry on error)
- [ ] Test all notifications

### Submission Lock
- [ ] Implement lock mechanism
- [ ] Triggered by "Final Submission" command
- [ ] Store lock state in workspace state
- [ ] Disable all future snapshots
- [ ] Show "Locked" indicator in status bar
- [ ] Prevent unlock by user (immutable)
- [ ] Confirm lock with user before activating
- [ ] Write tests

### Webview UI
- [ ] Create status webview (HTML/CSS/JS)
- [ ] Display:
  - [ ] Team info
  - [ ] Project info
  - [ ] Snapshot history (timestamps)
  - [ ] Last evaluation score (fetch from backend)
  - [ ] Next snapshot countdown
- [ ] Style with VS Code theme CSS
- [ ] Handle webview lifecycle (show/hide)
- [ ] Test webview

### Testing
- [ ] Unit tests for all modules
- [ ] Integration tests with mock backend
- [ ] E2E tests with test workspace:
  - [ ] Authentication flow
  - [ ] Auto-snapshot trigger
  - [ ] Manual snapshot
  - [ ] Final submission
  - [ ] Lock verification
- [ ] Test error scenarios
- [ ] Test offline resilience

### Packaging
- [ ] Install `@vscode/vsce` CLI
- [ ] Test packaging: `vsce package`
- [ ] Install `.vsix` file locally and test
- [ ] Create installation guide (`README.md` in extension folder)
- [ ] Add extension icon and screenshots
- [ ] Prepare for marketplace publication (optional)

---

## ☁️ Phase 6: AWS Deployment & Production

**Goal**: Deploy to AWS, set up CI/CD, enable monitoring  
**Duration**: 2 weeks  
**Status**: 🔴 Not Started

### Infrastructure as Code (Terraform)

#### VPC & Networking
- [ ] Create Terraform configuration for VPC
- [ ] Create public subnets (2 AZs)
- [ ] Create private subnets (2 AZs)
- [ ] Create Internet Gateway
- [ ] Create NAT Gateways (1 per AZ for HA)
- [ ] Set up route tables
- [ ] Configure security groups:
  - [ ] ALB (allow 80, 443 from internet)
  - [ ] ECS tasks (allow from ALB, internal communication)
  - [ ] RDS (allow 5432 from ECS only)
  - [ ] ElastiCache (allow 6379 from ECS only)
- [ ] Test VPC connectivity

#### RDS PostgreSQL
- [ ] Create RDS instance (db.t3.medium)
- [ ] Enable Multi-AZ deployment (for prod)
- [ ] Configure automated backups (retention: 7 days)
- [ ] Enable encryption at rest
- [ ] Create parameter group for performance tuning
- [ ] Set up CloudWatch alarms for RDS
- [ ] Test DB connection from local machine (via bastion or VPN)

#### ElastiCache Redis
- [ ] Create ElastiCache Redis cluster (cache.t3.small)
- [ ] Enable cluster mode (optional, for scaling)
- [ ] Enable encryption in transit and at rest
- [ ] Configure automatic failover
- [ ] Set up CloudWatch alarms
- [ ] Test Redis connection

#### S3 Buckets
- [ ] Create S3 bucket for snapshot storage
- [ ] Enable versioning
- [ ] Configure lifecycle policies (archive old snapshots after 90 days)
- [ ] Enable server-side encryption (AES-256 or KMS)
- [ ] Set up bucket policies (restrict access to ECS task role)
- [ ] Test S3 uploads from local machine

#### SQS
- [ ] Create SQS queue for evaluation jobs
- [ ] Create dead-letter queue
- [ ] Set visibility timeout (15 minutes)
- [ ] Set message retention (7 days)
- [ ] Configure CloudWatch alarms (queue depth)
- [ ] Test SQS publish and consume

#### ECS Fargate
- [ ] Create ECS cluster
- [ ] Create task definition for backend API:
  - [ ] Define container image (ECR)
  - [ ] Set CPU and memory limits
  - [ ] Define environment variables (from Secrets Manager)
  - [ ] Set up logging (CloudWatch Logs)
  - [ ] Assign IAM task role
- [ ] Create task definition for worker service
- [ ] Create task definition for dashboard
- [ ] Create ECS services:
  - [ ] Backend API (desired count: 2, autoscaling)
  - [ ] Worker (desired count: 2, autoscaling)
  - [ ] Dashboard (desired count: 2)
- [ ] Configure health checks
- [ ] Set up autoscaling policies (CPU/memory based)
- [ ] Test ECS task launch

#### Application Load Balancer (ALB)
- [ ] Create ALB
- [ ] Configure target groups:
  - [ ] Backend API target group (health check: `/health`)
  - [ ] Dashboard target group (health check: `/`)
- [ ] Configure listeners:
  - [ ] HTTP (port 80) → redirect to HTTPS
  - [ ] HTTPS (port 443) → forward to target groups
- [ ] Request SSL/TLS certificate from AWS Certificate Manager (ACM)
- [ ] Attach certificate to HTTPS listener
- [ ] Configure path-based routing (if needed)
- [ ] Test ALB health checks

#### Route 53 (DNS)
- [ ] Create hosted zone (if using custom domain)
- [ ] Create A record pointing to ALB
- [ ] Test DNS resolution

#### IAM Roles & Policies
- [ ] Create ECS task execution role (pull images, write logs)
- [ ] Create ECS task role for backend API:
  - [ ] S3 read/write permissions
  - [ ] SQS send messages
  - [ ] Secrets Manager read
- [ ] Create ECS task role for worker:
  - [ ] S3 read permissions
  - [ ] SQS receive/delete messages
  - [ ] Secrets Manager read
- [ ] Apply least privilege principle
- [ ] Test IAM permissions

#### AWS Secrets Manager
- [ ] Create secrets:
  - [ ] Database credentials (master user/password)
  - [ ] JWT secret
  - [ ] LLM API keys (OpenAI, Anthropic)
  - [ ] Any other sensitive config
- [ ] Update ECS task definitions to reference secrets
- [ ] Test secret retrieval

### Docker & Container Setup
- [ ] Create `Dockerfile` for backend API
  - [ ] Multi-stage build (smaller image)
  - [ ] Install dependencies
  - [ ] Build application
  - [ ] Set CMD/ENTRYPOINT
- [ ] Create `Dockerfile` for worker
- [ ] Create `Dockerfile` for dashboard (Next.js)
- [ ] Build Docker images locally and test
- [ ] Create Amazon ECR repositories:
  - [ ] `visionx-backend`
  - [ ] `visionx-worker`
  - [ ] `visionx-dashboard`
- [ ] Push images to ECR
- [ ] Test pulling images from ECR

### CI/CD Pipelines (GitHub Actions)

#### Backend Pipeline (`.github/workflows/backend.yml`)
- [ ] Trigger on push to `main` (backend changes)
- [ ] Steps:
  - [ ] Checkout code
  - [ ] Set up Node.js
  - [ ] Install dependencies
  - [ ] Run linting
  - [ ] Run unit tests
  - [ ] Build Docker image
  - [ ] Push to ECR
  - [ ] Update ECS service (rolling deployment)
  - [ ] Run smoke tests (health check endpoint)
  - [ ] Notify on Slack (optional)
- [ ] Test pipeline with a test commit

#### Worker Pipeline (`.github/workflows/worker.yml`)
- [ ] Same as backend pipeline (for worker)
- [ ] Test pipeline

#### Dashboard Pipeline (`.github/workflows/dashboard.yml`)
- [ ] Trigger on push to `main` (dashboard changes)
- [ ] Steps similar to backend (build Next.js app, push to ECR, deploy to ECS)
- [ ] Test pipeline

#### Extension Pipeline (`.github/workflows/extension.yml`)
- [ ] Trigger on release tag (e.g., `v1.0.0`)
- [ ] Steps:
  - [ ] Checkout code
  - [ ] Install dependencies
  - [ ] Build extension
  - [ ] Package with `vsce`
  - [ ] Upload `.vsix` to GitHub release
  - [ ] Optionally publish to VS Code Marketplace
- [ ] Test with a test release

### Database Migrations
- [ ] Write script to run TypeORM migrations on RDS
- [ ] Integrate into CI/CD (run before deploying new backend)
- [ ] Create backup before migration
- [ ] Test migration rollback
- [ ] Document migration process

### Monitoring & Logging

#### CloudWatch
- [ ] Set up log groups for:
  - [ ] Backend API logs
  - [ ] Worker logs
  - [ ] Dashboard logs
- [ ] Set retention policies (30 days)
- [ ] Create custom metrics:
  - [ ] Request count (API)
  - [ ] Error rate (API)
  - [ ] Snapshot upload count
  - [ ] Evaluation processing time
  - [ ] LLM API latency and cost
- [ ] Test log streaming

#### CloudWatch Alarms
- [ ] Create alarm: High error rate (> 5%)
- [ ] Create alarm: SQS queue depth > 100
- [ ] Create alarm: RDS connection failures
- [ ] Create alarm: ECS service unhealthy
- [ ] Create alarm: S3 upload failures
- [ ] Create alarm: LLM API rate limit hit
- [ ] Set up SNS topic for notifications
- [ ] Subscribe email/Slack webhook to SNS
- [ ] Test alarms by simulating issues

#### AWS X-Ray (Optional)
- [ ] Enable X-Ray for ECS tasks
- [ ] Instrument NestJS with X-Ray SDK
- [ ] Trace requests through services
- [ ] Identify bottlenecks
- [ ] Create X-Ray dashboard

#### Dashboards
- [ ] Create CloudWatch dashboard with widgets:
  - [ ] API request count (time series)
  - [ ] API latency (p50, p95, p99)
  - [ ] Error rates (pie chart)
  - [ ] Evaluation processing times (histogram)
  - [ ] Database metrics (connections, CPU)
  - [ ] Queue metrics (depth, age)
  - [ ] LLM costs (running total)
- [ ] Test dashboard updates

### Load Testing
- [ ] Set up k6 or Artillery for load testing
- [ ] Write load test script:
  - [ ] Simulate 300 teams submitting snapshots
  - [ ] Vary submission times
  - [ ] Include authentication
- [ ] Run load test against staging environment
- [ ] Measure:
  - [ ] API response times (should be < 200ms p95)
  - [ ] Worker processing times (should be < 5 min per snapshot)
  - [ ] Database performance (connection pool usage)
  - [ ] Redis performance (latency)
- [ ] Identify bottlenecks
- [ ] Tune autoscaling policies based on results
- [ ] Re-run load test after tuning
- [ ] Document load test results

### Security Hardening
- [ ] Enable AWS WAF on ALB:
  - [ ] Block common attacks (SQL injection, XSS)
  - [ ] Set rate limiting rules (per IP)
- [ ] Enable AWS GuardDuty for threat detection
- [ ] Run security scan on Docker images (Trivy, Snyk)
- [ ] Review IAM policies (ensure least privilege)
- [ ] Enable VPC Flow Logs (for auditing)
- [ ] Enable CloudTrail (audit AWS API calls)
- [ ] Test security configurations

### Documentation
- [ ] Write `docs/deployment/aws-setup.md`:
  - [ ] AWS account setup
  - [ ] Terraform usage
  - [ ] Manual steps (if any)
- [ ] Document environment variables (what they do)
- [ ] Create runbook for common issues:
  - [ ] Service not starting (check logs, health checks)
  - [ ] High error rate (check alarms, logs)
  - [ ] Database connection issues (check security groups, credentials)
  - [ ] Queue backlog (scale workers, check DLQ)
- [ ] Document rollback procedure:
  - [ ] Revert to previous ECS task definition
  - [ ] Rollback database migration
- [ ] Create disaster recovery plan:
  - [ ] Restore from RDS backup
  - [ ] Restore S3 data (if deleted)
  - [ ] Recover from complete failure

### Final Testing
- [ ] Test end-to-end flow in production:
  - [ ] Install extension from `.vsix`
  - [ ] Authenticate with production backend
  - [ ] Upload snapshot
  - [ ] Verify snapshot in S3
  - [ ] Verify evaluation completes
  - [ ] Check leaderboard updates in dashboard
  - [ ] Test WebSocket updates
  - [ ] Test manual override in dashboard
- [ ] Verify all monitoring and alerts work
- [ ] Test load with subset of real users (beta test)
- [ ] Fix any issues found

---

## 📊 Post-Launch: Phase 7 (Continuous Improvement)

**Goal**: Monitor, optimize, and iterate based on feedback  
**Duration**: Ongoing  
**Status**: 🔴 Not Started

### Observability Enhancements
- [ ] Set up detailed performance monitoring
- [ ] Track LLM cost per evaluation
- [ ] Monitor user engagement in extension
- [ ] Create weekly usage reports
- [ ] Set up custom dashboards for business metrics

### Feature Enhancements
- [ ] Extension: Add project progress graph
- [ ] Dashboard: Export full evaluation report as PDF
- [ ] Backend: Add evaluation templates for different themes
- [ ] Worker: Fine-tune LLM prompts based on feedback
- [ ] Dashboard: Add data visualization for trends

### Optimization
- [ ] Reduce LLM API costs (optimize prompts, reduce token usage)
- [ ] Improve static analysis performance (parallel processing)
- [ ] Cache common analysis results (e.g., dependency scan)
- [ ] Optimize database queries (add indexes, query optimization)
- [ ] Reduce Docker image sizes

### Bug Fixes & Support
- [ ] Set up error tracking (Sentry or similar)
- [ ] Monitor error rates and logs
- [ ] Address user-reported issues (GitHub issues)
- [ ] Improve error messages in extension
- [ ] Add troubleshooting guides

### User Feedback
- [ ] Collect feedback from hackathon participants
- [ ] Collect feedback from judges
- [ ] Collect feedback from organizers
- [ ] Prioritize feature requests
- [ ] Iterate on UX improvements

---

## 🎯 Success Metrics Checklist

### Technical Metrics
- [ ] System handles 300 teams with hourly snapshots
- [ ] Evaluation completes within 5 minutes per snapshot
- [ ] API response time < 200ms (p95)
- [ ] Worker processes 10-15 jobs concurrently
- [ ] Zero data loss on failures
- [ ] 99.5% uptime achieved

### Business Metrics
- [ ] Manual judging time reduced by 80%
- [ ] Fair and transparent scoring validated by judges
- [ ] Cheat detection catches at least 90% of anomalies
- [ ] Judges can shortlist top 20 teams in < 10 minutes
- [ ] Participants engaged with real-time leaderboard

---

## 📅 Timeline Summary

| Phase | Hour | Status |
|-------|-------|--------|
| Phase 0: Setup | 1 | 🔴 Not Started |
| Phase 1: Backend | 2 | 🔴 Not Started |
| Phase 2: Worker - Static | 1 | 🔴 Not Started |
| Phase 3: Worker - AI | 1 | 🔴 Not Started |
| Phase 4: Dashboard | 2 | 🔴 Not Started |
| Phase 5: Extension | 2 | 🔴 Not Started |
| Phase 6: Deployment | 2 | 🔴 Not Started |
| **Total** | **11 Hours** | |
| Phase 7: Continuous | Ongoing | |

---

**Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked

---

**Last Updated**: February 15, 2026  
**Current Phase**: Phase 0 - Project Setup

**Next Action**: Start Phase 0 by following [QUICKSTART.md](./QUICKSTART.md)
