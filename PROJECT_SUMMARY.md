# 📋 Project Summary - VisionX Eval

## 🎯 What We're Building

An **AI-powered hackathon evaluation platform** that automatically monitors, analyzes, and scores 300+ hackathon teams in real-time using:
- **VS Code Extension** for project monitoring
- **Backend API** for data ingestion
- **Worker Service** for automated evaluation (static analysis + AI)
- **Admin Dashboard** for live leaderboard and judging

---

## 📚 Documentation Structure

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[building.md](./building.md)** | Original requirements & specifications | Understanding the vision |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Complete folder structure & tech stack | Before coding |
| **[DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md)** | 6-phase implementation plan | Planning work |
| **[QUICKSTART.md](./QUICKSTART.md)** | Setup instructions for Phase 0 | Starting development |

---

## 🏗️ System Architecture Overview

```
┌─────────────────┐
│  VS Code Ext    │  ──► Snapshots every 45 min
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Backend API    │  ──► Auth, Ingestion, Storage
│  (NestJS)       │
└────────┬────────┘
         │ SQS Queue
         ▼
┌─────────────────┐
│ Evaluation      │  ──► Static Analysis + AI
│ Worker          │
│ (NestJS)        │
└────────┬────────┘
         │ Updates
         ▼
┌─────────────────┐
│  PostgreSQL     │  ←── Stores all data
│  Redis          │  ←── Leaderboard cache
└────────┬────────┘
         │ WebSocket/REST
         ▼
┌─────────────────┐
│  Dashboard      │  ──► Real-time leaderboard
│  (Next.js)      │      Admin tools, judging
└─────────────────┘
```

---

## 🗂️ Folder Structure (Monorepo)

```
visionx-eval/
├── apps/
│   ├── vscode-extension/      # VS Code extension (TypeScript)
│   ├── backend/               # NestJS API service
│   ├── worker/                # NestJS evaluation worker
│   └── dashboard/             # Next.js admin dashboard
│
├── packages/
│   ├── shared/                # Shared types & utilities
│   └── eslint-config/         # Shared linting config
│
├── infrastructure/            # Terraform for AWS
│   ├── terraform/
│   └── scripts/
│
├── docs/                      # Documentation
│   ├── architecture/
│   ├── development/
│   ├── deployment/
│   └── user-guides/
│
└── scripts/                   # Helper scripts
```

---

## 🚀 Development Phases Timeline

| Phase | Duration | Focus Area | Key Deliverables |
|-------|----------|------------|------------------|
| **Phase 0** | 1 week | Setup & Foundation | Monorepo, shared types, dev environment |
| **Phase 1** | 2 weeks | Backend API | Team auth, snapshot ingestion, S3 storage |
| **Phase 2** | 1 week | Worker - Static Analysis | SQS integration, code analysis pipeline |
| **Phase 3** | 1 week | Worker - AI Evaluation | LLM integration, scoring engine, cheat detection |
| **Phase 4** | 2 weeks | Admin Dashboard | Real-time leaderboard, team details, judge tools |
| **Phase 5** | 2 weeks | VS Code Extension | Auto-snapshots, authentication, submission lock |
| **Phase 6** | 2 weeks | AWS Deployment | Infrastructure, CI/CD, monitoring |
| **Total** | **11 weeks** | **MVP Launch** | **Production-ready system** |

---

## 🛠️ Technology Stack

### Frontend
- **Extension**: TypeScript + VS Code API
- **Dashboard**: Next.js 14, Tailwind CSS, shadcn/ui, Socket.IO

### Backend
- **API**: NestJS, TypeORM, PostgreSQL, Redis, AWS S3
- **Worker**: NestJS, ESLint, OpenAI/Anthropic SDK, AWS SQS

### Infrastructure
- **Cloud**: AWS (ECS Fargate, RDS, ElastiCache, S3, SQS, ALB)
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch, X-Ray

---

## 📊 Data Flow

### 1. Snapshot Collection (Every 45 minutes)
```
VS Code Extension
  ↓
  • Scans workspace
  • Detects tech stack
  • Collects file tree & LOC
  • Compresses payload
  ↓
Backend API (/snapshots)
  ↓
  • Validates JWT
  • Checks hash (skip duplicates)
  • Stores metadata in PostgreSQL
  • Uploads files to S3
  • Publishes to SQS queue
```

### 2. Evaluation Pipeline (Async)
```
Worker Service (consumes SQS)
  ↓
  • Retrieves snapshot from S3
  ↓
Static Analysis (60% weight)
  • Lint score
  • Complexity score
  • Security scan
  • Test coverage
  • Build validation
  • Code structure
  ↓
AI Evaluation (40% weight)
  • Innovation
  • Architecture
  • Scalability
  • Problem alignment
  • Readability
  • Documentation
  ↓
Scoring Engine
  • Calculate final score
  • Store in PostgreSQL
  • Update Redis leaderboard
  ↓
Dashboard (WebSocket notification)
  • Leaderboard refreshes
  • Score details updated
```

---

## 🎯 Key Features

### VS Code Extension
✅ Team authentication  
✅ Auto-snapshot every 45 minutes  
✅ Manual "Evaluate Now" command  
✅ Final submission with lock  
✅ Real-time status updates  
✅ Offline resilience with retry  

### Backend API
✅ JWT authentication  
✅ Snapshot ingestion & deduplication  
✅ S3 file storage  
✅ SQS job queuing  
✅ RESTful APIs with Swagger docs  

### Worker Service
✅ Static code analysis (ESLint, complexity, security)  
✅ AI-powered evaluation (LLM)  
✅ Cheat detection (anomaly, similarity)  
✅ Scoring algorithm (weighted)  
✅ Concurrent processing (10-15 jobs)  

### Admin Dashboard
✅ Real-time leaderboard (WebSocket)  
✅ Team details with score breakdown  
✅ AI feedback display  
✅ Manual score overrides  
✅ Judge shortlist (top 20)  
✅ Side-by-side comparison tool  

---

## 🔑 Success Criteria

### Technical Performance
- Handle **300 teams** submitting every hour
- Evaluation completes in **< 5 minutes**
- API response time **< 200ms** (p95)
- Zero data loss on failures
- **99.5% uptime**

### Business Impact
- Reduce manual judging time by **80%**
- Fair and transparent scoring
- Catch cheating attempts automatically
- Enable judges to shortlist top 20 quickly
- Engage participants with real-time leaderboard

---

## 🚦 Current Status

### ✅ Completed
- [x] Requirements documented
- [x] Architecture designed
- [x] Development phases planned
- [x] Folder structure defined
- [x] Tech stack finalized

### 🎯 Next Steps
1. **Start Phase 0**: Follow [QUICKSTART.md](./QUICKSTART.md)
2. **Set up monorepo**: pnpm workspaces
3. **Create shared types**: `packages/shared`
4. **Set up dev environment**: Docker Compose (PostgreSQL + Redis)
5. **First commit**: Initialize git repository

---

## 👥 Team Organization

### Development Tracks (Can work in parallel after Phase 1)

| Track | Components | Lead Focus |
|-------|------------|------------|
| **Backend** | API + Worker | Authentication, evaluation pipeline |
| **Frontend** | Dashboard | UI/UX, real-time updates |
| **Extension** | VS Code Ext | Snapshot collection, user experience |
| **Infrastructure** | AWS/Terraform | Deployment, scalability, monitoring |

---

## 📞 Getting Help

### For Setup Issues
→ See [QUICKSTART.md](./QUICKSTART.md) troubleshooting section

### For Architecture Questions
→ See [ARCHITECTURE.md](./ARCHITECTURE.md)

### For Phase-Specific Tasks
→ See [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md)

### For Original Requirements
→ See [building.md](./building.md)

---

## 🎓 Learning Resources

### NestJS
- [Official Docs](https://docs.nestjs.com/)
- [TypeORM Guide](https://typeorm.io/)

### Next.js
- [Next.js 14 Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### VS Code Extension
- [Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/guides/overview)

### AWS
- [ECS Fargate](https://aws.amazon.com/fargate/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

## 🎯 Ready to Start?

1. **Read**: [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
2. **Follow**: [QUICKSTART.md](./QUICKSTART.md) - Set up your environment
3. **Execute**: [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) - Start Phase 0
4. **Build**: Start coding! 🚀

---

**Last Updated**: February 15, 2026  
**Version**: 1.0.0  
**Status**: Ready for Development 🟢
