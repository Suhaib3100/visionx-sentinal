🚀 PROJECT: AI Powered Hackathon Evaluation Platform

> **📋 ORGANIZED DOCUMENTATION NOW AVAILABLE:**
> - **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete codebase structure & technology stack
> - **[DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md)** - 6-phase implementation plan with tasks
> - **[QUICKSTART.md](./QUICKSTART.md)** - Step-by-step setup guide to get started

---

🎯 Objective

Build an automated evaluation system for hackathon projects that:

Monitors project code via VS Code extension

Periodically snapshots project state

Runs static analysis

Uses LLM for structured evaluation

Generates real time leaderboard

Shortlists top teams for manual judging

Supports:

300 teams

Hourly evaluation

Scalable AWS infrastructure

🧱 SYSTEM COMPONENTS

There are three major systems:

VS Code Extension

Backend Evaluation Platform

Admin Dashboard

All deployed on AWS.

1️⃣ VS CODE EXTENSION ARCHITECTURE
Purpose

Collect structured project snapshots and send to backend.

Extension Core Modules
1. Auth Module

Responsibilities:

Input Team ID

Validate with backend

Store JWT token

Store Project ID

2. Workspace Scanner

On activation:

Detect workspace root

Initialize Git if missing

Detect tech stack

Build file tree

Generate project hash

3. Snapshot Engine

Triggers:

Every 45 minutes

Manual “Evaluate Now”

Final Submission

Snapshot includes:

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
  buildStatus,
  testSummary,
  changedFiles[]
}


Rules:

Ignore node_modules

Ignore build/dist folders

Only include changed files

Skip if hash unchanged

4. Diff Engine

Before sending:

Compare current hash with last snapshot

If unchanged → skip

Compress payload

Send to backend

5. Submission Lock

At hackathon end:

Final snapshot

Lock extension submission

2️⃣ BACKEND CORE ARCHITECTURE

Built with:

NestJS

PostgreSQL (RDS)

Redis (ElastiCache)

SQS

ECS Fargate

S3

Backend Services
A. API Service (ECS Fargate)

Handles:

Team registration

Snapshot ingestion

Auth validation

Dashboard APIs

B. Evaluation Worker Service (Separate ECS)

Consumes SQS queue.

Pipeline:

Retrieve snapshot metadata

Pull files from S3

Run static analysis

Generate architecture summary

Call LLM

Compute final score

Update DB

Update Redis leaderboard

3️⃣ DATABASE SCHEMA (PostgreSQL)
teams

id

name

token

created_at

projects

id

team_id

theme

problem_statement

created_at

snapshots

id

project_id

hash

timestamp

s3_path

static_metrics

snapshot_id

lint_score

complexity_score

security_score

test_score

structure_score

build_score

ai_reports

snapshot_id

innovation_score

architecture_score

scalability_score

alignment_score

readability_score

documentation_score

feedback

risk_flags

final_scores

project_id

total_score

last_updated

manual_overrides

project_id

judge_score

4️⃣ STATIC ANALYSIS PIPELINE

Runs before LLM call.

Tools:

ESLint

Code complexity analyzer

Dependency vulnerability scanner

Test coverage extractor

Output structured numeric metrics.

Weight: 60 percent.

5️⃣ AI EVALUATION DESIGN

LLM receives:

Problem statement

Expected outcome

Static metrics

Architecture summary

Core file summaries

LLM must return strict JSON:

{
  "innovation_score": number,
  "architecture_score": number,
  "scalability_score": number,
  "alignment_score": number,
  "readability_score": number,
  "documentation_score": number,
  "feedback": "string",
  "risk_flags": []
}


Weight: 40 percent.

Only ONE LLM call per snapshot.

6️⃣ SCORING ENGINE

Final Score =

(static_score * 0.6) + (ai_score * 0.4)

Store breakdown.

Update Redis leaderboard.

7️⃣ DASHBOARD ARCHITECTURE

Built with:

Next.js

Tailwind

WebSocket for real time updates

Features:

Admin:

Live leaderboard

Score breakdown

AI feedback

Risk flags

Progress graph

Manual override slider

Judge:

Top 20 shortlist

Side by side comparison

Snapshot timeline

8️⃣ AWS INFRASTRUCTURE DESIGN
Compute

ECS Fargate:

API Service

Evaluation Worker

Dashboard

Database

RDS PostgreSQL

Private subnet

Cache

ElastiCache Redis

Leaderboard

Session caching

Storage

S3:

Snapshot file storage

Logs

Queue

SQS:

Evaluation job queue

Networking

VPC

ALB for API + Dashboard

Private subnets for DB + Redis

Security groups configured

9️⃣ LOAD STRATEGY

300 teams
Hourly snapshot

300 evaluation jobs per hour.

Worker processes:

10 to 20 concurrent jobs

Hash check prevents redundant LLM calls.

🔟 CHEAT DETECTION LOGIC

Automatic flags:

Large LOC spike anomaly

Identical file hashes across teams

No incremental growth

Sudden massive paste

Flag stored in ai_reports.risk_flags.

1️⃣1️⃣ DEVELOPMENT PHASES

Phase 1:

Backend API

DB schema

Snapshot endpoint

S3 storage

Phase 2:

SQS integration

Static analysis worker

Phase 3:

LLM evaluation integration

Scoring engine

Phase 4:

Dashboard

Phase 5:

VS Code extension

Phase 6:

AWS deployment

Load testing

🔥 WHAT MAKES THIS DIFFERENT

This is not simple repo scoring.

This system:

Tracks incremental progress

Combines static analysis + AI reasoning

Produces structured scoring

Reduces manual judging time drastically

Scales for large hackathons