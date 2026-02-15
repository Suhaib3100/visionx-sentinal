# 🎯 VisionX Eval - AI-Powered Hackathon Evaluation Platform

> **Automated evaluation system for hackathon projects using static analysis and AI**

[![Phase](https://img.shields.io/badge/Phase-0%20Setup-blue)]() 
[![Status](https://img.shields.io/badge/Status-Planning-yellow)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 📚 Quick Navigation

| Document | Description | When to Use |
|----------|-------------|-------------|
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | 📋 Bird's eye view of the entire project | Start here for overview |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ Complete folder structure & tech stack | Before coding |
| **[DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md)** | 🚀 6-phase implementation roadmap | Planning and execution |
| **[QUICKSTART.md](./QUICKSTART.md)** | ⚡ Step-by-step Phase 0 setup guide | Starting development |
| **[CHECKLIST.md](./CHECKLIST.md)** | ✅ Master task tracker for all phases | Tracking progress |
| **[DIAGRAMS.md](./DIAGRAMS.md)** | 🎨 Visual architecture diagrams | Understanding system design |
| **[building.md](./building.md)** | 📝 Original requirements document | Understanding the vision |

---

## 🎯 What We're Building

An **AI-powered hackathon evaluation platform** that:

✅ **Monitors** 300+ teams' projects via VS Code extension  
✅ **Analyzes** code with static analysis + AI evaluation  
✅ **Scores** projects fairly with transparent metrics  
✅ **Displays** real-time leaderboard to engage participants  
✅ **Shortlists** top teams for manual judging  
✅ **Detects** cheating attempts automatically  

### System Components

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  VS Code Ext    │ ────► │  Backend API    │ ────► │ Eval Worker     │
│  (Monitoring)   │       │  (Ingestion)    │       │  (Analysis+AI)  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                                              │
                                                              ▼
                          ┌─────────────────┐       ┌─────────────────┐
                          │  Admin Dash     │ ◄──── │  PostgreSQL +   │
                          │  (Leaderboard)  │       │  Redis          │
                          └─────────────────┘       └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Docker** and **Docker Compose**
- **Git** configured
- **AWS CLI** (for deployment later)

### Quick Start (3 Steps)

1. **Read the Overview**
   ```bash
   # Start here to understand the project
   cat PROJECT_SUMMARY.md
   ```

2. **Set Up Environment**
   ```bash
   # Follow the detailed setup guide
   cat QUICKSTART.md
   # Then run:
   ./scripts/setup.sh
   ```

3. **Start Development**
   ```bash
   # Follow Phase 0 checklist
   cat CHECKLIST.md
   # Track your progress as you go
   ```

---

## 📂 Project Structure (Monorepo)

```
visionx-eval/
├── apps/                       # Applications
│   ├── vscode-extension/       # VS Code extension (TypeScript)
│   ├── backend/                # NestJS API service
│   ├── worker/                 # NestJS evaluation worker
│   └── dashboard/              # Next.js admin dashboard
│
├── packages/                   # Shared libraries
│   ├── shared/                 # Shared types & utilities
│   └── eslint-config/          # Shared ESLint config
│
├── infrastructure/             # Infrastructure as Code
│   ├── terraform/              # Terraform for AWS
│   └── scripts/                # Deployment scripts
│
├── docs/                       # Documentation
│   ├── architecture/
│   ├── development/
│   ├── deployment/
│   └── user-guides/
│
└── scripts/                    # Helper scripts
    ├── setup.sh                # Initial setup
    ├── clean.sh                # Clean workspace
    ├── test-all.sh             # Run all tests
    └── build-all.sh            # Build all packages
```

---

## 🛠️ Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Extension** | TypeScript, VS Code API, esbuild |
| **Backend** | NestJS, TypeORM, PostgreSQL, Redis, AWS S3, SQS |
| **Worker** | NestJS, ESLint, OpenAI/Anthropic SDK |
| **Dashboard** | Next.js 14, Tailwind CSS, shadcn/ui, Socket.IO |
| **Infrastructure** | AWS (ECS Fargate, RDS, ElastiCache, S3, SQS), Terraform |
| **CI/CD** | GitHub Actions |
| **Monitoring** | CloudWatch, X-Ray |

---

## 📅 Development Timeline

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| **0** | 1 week | Setup & Foundation | Monorepo, shared types, dev environment |
| **1** | 2 weeks | Backend API | Team auth, snapshot ingestion, S3 storage |
| **2** | 1 week | Worker - Static Analysis | SQS integration, code analysis pipeline |
| **3** | 1 week | Worker - AI Evaluation | LLM integration, scoring, cheat detection |
| **4** | 2 weeks | Admin Dashboard | Real-time leaderboard, admin tools |
| **5** | 2 weeks | VS Code Extension | Auto-snapshots, authentication |
| **6** | 2 weeks | AWS Deployment | Infrastructure, CI/CD, monitoring |
| **Total** | **11 weeks** | **MVP Launch** | **Production-ready system** |

---

## 🎓 Key Features

### For Participants (VS Code Extension)
- 🔐 Simple team authentication
- ⏱️ Auto-snapshot every 45 minutes
- 🚀 Manual "Evaluate Now" button
- 🔒 Final submission with lock
- 📊 Real-time status updates

### For Judges (Admin Dashboard)
- 📈 Live leaderboard with real-time updates
- 🎯 Top 20 shortlist for manual judging
- 🔍 Side-by-side team comparison
- 📋 Detailed score breakdowns
- 💬 AI-generated feedback

### For Organizers
- 🤖 80% reduction in manual judging time
- 🛡️ Automatic cheat detection
- 📊 Fair and transparent scoring
- ⚙️ Manual score override capability
- 📈 Analytics and insights

---

## 🔑 Architecture Highlights

### Evaluation Pipeline
```
Snapshot Upload → S3 Storage → SQS Queue → Worker Service
                                              ↓
                                    Static Analysis (60%)
                                        ├─ Lint Score
                                        ├─ Complexity Score
                                        ├─ Security Scan
                                        ├─ Test Coverage
                                        ├─ Build Check
                                        └─ Structure Analysis
                                              ↓
                                    AI Evaluation (40%)
                                        ├─ Innovation
                                        ├─ Architecture
                                        ├─ Scalability
                                        ├─ Alignment
                                        ├─ Readability
                                        └─ Documentation
                                              ↓
                                    Final Score Calculation
                                              ↓
                      PostgreSQL (storage) + Redis (leaderboard)
                                              ↓
                                    Dashboard (WebSocket update)
```

### Data Flow
1. **Extension** monitors workspace and sends snapshots
2. **Backend API** validates, stores in PostgreSQL, uploads to S3, queues job
3. **Worker** processes queue, runs analysis, calls LLM, calculates scores
4. **Dashboard** displays live leaderboard via WebSocket updates

---

## 📊 Success Criteria

### Technical Performance
- ✅ Handle **300 teams** submitting hourly
- ✅ Evaluation completes in **< 5 minutes**
- ✅ API response time **< 200ms** (p95)
- ✅ **99.5% uptime**
- ✅ Zero data loss

### Business Impact
- ✅ **80% reduction** in manual judging time
- ✅ Fair, transparent, and explainable scoring
- ✅ Catch **90%+** of cheating attempts
- ✅ Engage participants with real-time feedback
- ✅ Enable quick shortlisting of top teams

---

## 🧪 Development Workflow

```bash
# Install dependencies
pnpm install

# Start local services (PostgreSQL + Redis)
docker-compose up -d

# Start all apps in development mode
pnpm run dev

# Run tests across all packages
pnpm run test

# Lint code
pnpm run lint

# Build all packages
pnpm run build

# Clean everything
./scripts/clean.sh
```

---

## 📖 Documentation Guide

### For Project Managers
1. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for overview
2. Review [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) for planning
3. Track progress with [CHECKLIST.md](./CHECKLIST.md)

### For Developers
1. Understand system design: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. View visual diagrams: [DIAGRAMS.md](./DIAGRAMS.md)
3. Set up environment: [QUICKSTART.md](./QUICKSTART.md)
4. Follow phase tasks: [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md)
5. Track work: [CHECKLIST.md](./CHECKLIST.md)

### For Architects
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for tech decisions
2. Study [DIAGRAMS.md](./DIAGRAMS.md) for system design
3. Reference [building.md](./building.md) for original requirements

---

## 🤝 Contributing

1. **Pick a Task**: Choose from [CHECKLIST.md](./CHECKLIST.md)
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Follow Standards**: See `docs/development/coding-standards.md`
4. **Write Tests**: Maintain >80% coverage
5. **Submit PR**: Follow PR template
6. **Get Review**: Address feedback
7. **Merge**: After approval

---

## 🔍 Current Status

### ✅ Completed
- [x] Requirements documented ([building.md](./building.md))
- [x] Architecture designed ([ARCHITECTURE.md](./ARCHITECTURE.md))
- [x] Development phases planned ([DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md))
- [x] Folder structure defined
- [x] Tech stack finalized
- [x] Documentation created

### 🎯 Next Steps (Phase 0)
1. Set up monorepo with pnpm workspaces
2. Create shared types package
3. Configure development tools (ESLint, Prettier, Husky)
4. Set up Docker Compose for local services
5. Write setup scripts
6. Make initial git commit

**👉 Start here: [QUICKSTART.md](./QUICKSTART.md)**

---

## 💡 Pro Tips

- **Monorepo Commands**: Use pnpm filtering: `pnpm --filter @visionx/backend dev`
- **Parallel Execution**: Run tests in parallel: `pnpm --parallel test`
- **Watch Mode**: Most packages support `pnpm run dev` for auto-rebuild
- **Clean Slate**: Run `./scripts/clean.sh` when things get messy
- **Documentation**: Keep docs updated as you build
- **Testing**: Write tests as you code, not after

---

## 🆘 Need Help?

### Setup Issues
→ See [QUICKSTART.md](./QUICKSTART.md) troubleshooting section

### Architecture Questions
→ See [ARCHITECTURE.md](./ARCHITECTURE.md) or [DIAGRAMS.md](./DIAGRAMS.md)

### Task Planning
→ See [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) or [CHECKLIST.md](./CHECKLIST.md)

### Requirements Clarification
→ See [building.md](./building.md) for original specs

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🌟 Project Vision

> **"To transform hackathon evaluation from manual, subjective, and time-consuming to automated, fair, and engaging with AI assistance."**

We believe that:
- **Participants deserve** immediate feedback and transparency
- **Judges deserve** efficient tools to focus on final decisions
- **Organizers deserve** scalable solutions for large hackathons
- **Innovation should be** recognized and rewarded fairly

---

## 📞 Team & Contact

- **Project Lead**: [Your Name]
- **Backend Team**: TBD
- **Frontend Team**: TBD
- **DevOps Team**: TBD

---

## 🎯 Ready to Build?

```bash
# 1. Clone the repository
git clone <repo-url>
cd visionx-eval

# 2. Read the overview
cat PROJECT_SUMMARY.md

# 3. Set up your environment
cat QUICKSTART.md

# 4. Start Phase 0
cat CHECKLIST.md

# Let's build something amazing! 🚀
```

---

**Last Updated**: February 15, 2026  
**Version**: 1.0.0  
**Status**: 🟢 Ready for Development

---

<p align="center">
  <sub>Built with ❤️ for the hackathon community</sub>
</p>
