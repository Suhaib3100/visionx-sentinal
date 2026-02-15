# 🎨 System Architecture Diagrams

This document contains visual architecture diagrams for VisionX Eval.

## 📊 High-Level System Architecture

```mermaid
graph TB
    subgraph "Developer Environment"
        VSCode[VS Code Extension]
    end
    
    subgraph "AWS Cloud"
        subgraph "Frontend"
            ALB[Application Load Balancer]
            Dashboard[Next.js Dashboard<br/>ECS Fargate]
        end
        
        subgraph "Backend Services"
            API[Backend API<br/>NestJS/ECS Fargate]
            Worker[Evaluation Worker<br/>NestJS/ECS Fargate]
        end
        
        subgraph "Data Layer"
            RDS[(PostgreSQL<br/>RDS)]
            Redis[(Redis<br/>ElastiCache)]
            S3[S3 Bucket<br/>Snapshot Storage]
        end
        
        subgraph "Messaging"
            SQS[SQS Queue<br/>Evaluation Jobs]
        end
        
        subgraph "External Services"
            LLM[OpenAI/Anthropic<br/>LLM API]
        end
    end
    
    VSCode -->|HTTPS<br/>Upload Snapshot| API
    API -->|Store Metadata| RDS
    API -->|Upload Files| S3
    API -->|Publish Job| SQS
    SQS -->|Consume| Worker
    Worker -->|Retrieve Files| S3
    Worker -->|AI Evaluation| LLM
    Worker -->|Store Results| RDS
    Worker -->|Update Leaderboard| Redis
    ALB -->|Route Traffic| API
    ALB -->|Route Traffic| Dashboard
    Dashboard -->|REST API| API
    Dashboard -->|WebSocket| API
    API -->|Query Cache| Redis
    API -->|Query Data| RDS
```

## 🔄 Data Flow - Snapshot Submission

```mermaid
sequenceDiagram
    participant Ext as VS Code Extension
    participant API as Backend API
    participant S3 as S3 Storage
    participant DB as PostgreSQL
    participant SQS as SQS Queue
    participant Worker as Evaluation Worker
    participant LLM as LLM API
    participant Redis as Redis Cache
    participant Dash as Dashboard
    
    Note over Ext: Timer triggers (45 min)
    Ext->>Ext: Scan workspace
    Ext->>Ext: Generate hash
    Ext->>Ext: Compress files
    
    Ext->>API: POST /snapshots<br/>(JWT + payload)
    
    API->>API: Validate JWT
    API->>API: Check hash duplicate
    
    alt Hash is new
        API->>DB: Store metadata
        API->>S3: Upload files
        API->>SQS: Publish job message
        API->>Ext: 201 Created
        
        SQS->>Worker: Consume message
        Worker->>S3: Retrieve files
        Worker->>Worker: Static Analysis
        Worker->>LLM: AI Evaluation
        LLM->>Worker: Scores + Feedback
        Worker->>Worker: Calculate final score
        Worker->>DB: Store results
        Worker->>Redis: Update leaderboard
        
        Redis->>Dash: WebSocket: Score updated
        Dash->>Dash: Refresh leaderboard
    else Hash exists (duplicate)
        API->>Ext: 200 OK (skipped)
    end
```

## 🏗️ Component Architecture

```mermaid
graph LR
    subgraph "VS Code Extension"
        Auth[Auth Module]
        Scanner[Workspace Scanner]
        Snapshot[Snapshot Engine]
        Diff[Diff Engine]
        Upload[Upload Manager]
        
        Scanner --> Snapshot
        Diff --> Snapshot
        Snapshot --> Upload
        Auth --> Upload
    end
    
    subgraph "Backend API"
        AuthAPI[Auth Service]
        Teams[Teams Service]
        Projects[Projects Service]
        Snapshots[Snapshots Service]
        S3Svc[S3 Service]
        SQSSvc[SQS Publisher]
        
        Snapshots --> S3Svc
        Snapshots --> SQSSvc
    end
    
    subgraph "Worker Service"
        Consumer[SQS Consumer]
        Orchestrator[Evaluation Orchestrator]
        Static[Static Analyzer]
        AI[AI Evaluator]
        Scoring[Score Calculator]
        Cheat[Cheat Detector]
        
        Consumer --> Orchestrator
        Orchestrator --> Static
        Orchestrator --> AI
        Static --> Scoring
        AI --> Scoring
        Orchestrator --> Cheat
    end
    
    Upload -.->|HTTPS| Snapshots
    Orchestrator -.->|Read| S3Svc
```

## 📦 Database Schema

```mermaid
erDiagram
    teams ||--o{ projects : has
    projects ||--o{ snapshots : has
    snapshots ||--o| static_metrics : analyzed_by
    snapshots ||--o| ai_reports : evaluated_by
    projects ||--o| final_scores : scored
    projects ||--o| manual_overrides : overridden
    
    teams {
        uuid id PK
        string name
        string token
        timestamp created_at
    }
    
    projects {
        uuid id PK
        uuid team_id FK
        string theme
        text problem_statement
        timestamp created_at
    }
    
    snapshots {
        uuid id PK
        uuid project_id FK
        string hash
        timestamp timestamp
        string s3_path
    }
    
    static_metrics {
        uuid id PK
        uuid snapshot_id FK
        decimal lint_score
        decimal complexity_score
        decimal security_score
        decimal test_score
        decimal structure_score
        decimal build_score
    }
    
    ai_reports {
        uuid id PK
        uuid snapshot_id FK
        decimal innovation_score
        decimal architecture_score
        decimal scalability_score
        decimal alignment_score
        decimal readability_score
        decimal documentation_score
        text feedback
        jsonb risk_flags
    }
    
    final_scores {
        uuid id PK
        uuid project_id FK
        decimal total_score
        decimal static_score
        decimal ai_score
        timestamp last_updated
    }
    
    manual_overrides {
        uuid id PK
        uuid project_id FK
        decimal judge_score
        text reason
        uuid judge_id
        timestamp created_at
    }
```

## 🔀 Evaluation Pipeline

```mermaid
flowchart TD
    Start([Snapshot Received]) --> Validate{Valid?}
    Validate -->|No| Reject[Reject & Notify]
    Validate -->|Yes| Hash{Hash<br/>Duplicate?}
    Hash -->|Yes| Skip[Skip Evaluation]
    Hash -->|No| Store[Store in S3 & DB]
    Store --> Queue[Add to SQS]
    Queue --> Worker[Worker Picks Job]
    Worker --> Retrieve[Retrieve from S3]
    Retrieve --> Extract[Extract Files]
    
    Extract --> Static[Static Analysis]
    Static --> Lint[Lint Score]
    Static --> Complexity[Complexity Score]
    Static --> Security[Security Scan]
    Static --> Test[Test Coverage]
    Static --> Build[Build Check]
    Static --> Structure[Structure Analysis]
    
    Lint --> StaticAgg[Aggregate Static Score]
    Complexity --> StaticAgg
    Security --> StaticAgg
    Test --> StaticAgg
    Build --> StaticAgg
    Structure --> StaticAgg
    
    StaticAgg --> Prompt[Build LLM Prompt]
    Prompt --> LLM[Call LLM API]
    LLM --> Validate2{Valid<br/>Response?}
    Validate2 -->|No| Retry{Retry<br/>Available?}
    Retry -->|Yes| LLM
    Retry -->|No| Error[Log Error & Default Score]
    Validate2 -->|Yes| Parse[Parse AI Scores]
    
    Parse --> Cheat[Cheat Detection]
    Cheat --> Flags[Generate Risk Flags]
    
    StaticAgg --> Final[Calculate Final Score]
    Parse --> Final
    Flags --> Final
    Error --> Final
    
    Final --> SaveDB[Save to PostgreSQL]
    Final --> SaveRedis[Update Redis Leaderboard]
    SaveDB --> Notify[WebSocket Notification]
    SaveRedis --> Notify
    Notify --> End([Complete])
    
    Skip --> End
    Reject --> End
```

## 🌐 Deployment Architecture (AWS)

```mermaid
graph TB
    subgraph "AWS Cloud"
        subgraph "Availability Zone 1"
            subgraph "Public Subnet 1"
                ALB1[ALB]
                NAT1[NAT Gateway]
            end
            
            subgraph "Private Subnet 1"
                API1[API Task]
                Worker1[Worker Task]
                Dash1[Dashboard Task]
                RDS1[(RDS Primary)]
                Redis1[(Redis Primary)]
            end
        end
        
        subgraph "Availability Zone 2"
            subgraph "Public Subnet 2"
                NAT2[NAT Gateway]
            end
            
            subgraph "Private Subnet 2"
                API2[API Task]
                Worker2[Worker Task]
                Dash2[Dashboard Task]
                RDS2[(RDS Standby)]
                Redis2[(Redis Replica)]
            end
        end
        
        subgraph "Shared Services"
            S3[S3 Bucket]
            SQS[SQS Queue]
            ECR[ECR Registry]
            Secrets[Secrets Manager]
            CloudWatch[CloudWatch]
        end
    end
    
    Internet[Internet] --> Route53[Route 53]
    Route53 --> ALB1
    ALB1 --> API1
    ALB1 --> API2
    ALB1 --> Dash1
    ALB1 --> Dash2
    
    API1 --> RDS1
    API2 --> RDS1
    RDS1 -.Replication.-> RDS2
    
    API1 --> Redis1
    API2 --> Redis1
    Redis1 -.Replication.-> Redis2
    
    API1 --> S3
    API2 --> S3
    Worker1 --> S3
    Worker2 --> S3
    
    API1 --> SQS
    API2 --> SQS
    Worker1 --> SQS
    Worker2 --> SQS
    
    API1 -.Logs.-> CloudWatch
    API2 -.Logs.-> CloudWatch
    Worker1 -.Logs.-> CloudWatch
    Worker2 -.Logs.-> CloudWatch
    Dash1 -.Logs.-> CloudWatch
    Dash2 -.Logs.-> CloudWatch
```

## 🔐 Security Architecture

```mermaid
flowchart TD
    Client[VS Code Extension / Dashboard]
    
    subgraph "Security Layers"
        WAF[AWS WAF<br/>Rate Limiting & Filtering]
        ALB[ALB<br/>TLS Termination]
        Auth[JWT Authentication]
        RBAC[Role-Based Access Control]
        
        subgraph "Network Security"
            SG1[Security Group: ALB]
            SG2[Security Group: ECS]
            SG3[Security Group: RDS]
            SG4[Security Group: Redis]
        end
        
        subgraph "Data Security"
            Encrypt1[S3 Encryption at Rest]
            Encrypt2[RDS Encryption at Rest]
            Encrypt3[Redis Encryption in Transit]
            TLS[TLS 1.3 for All Connections]
        end
        
        IAM[IAM Roles & Policies<br/>Least Privilege]
        Secrets[AWS Secrets Manager]
    end
    
    Client -->|HTTPS| WAF
    WAF --> ALB
    ALB --> Auth
    Auth --> RBAC
    
    RBAC --> SG2
    SG2 --> SG3
    SG2 --> SG4
    
    SG2 --> Encrypt1
    SG3 --> Encrypt2
    SG4 --> Encrypt3
```

## 📈 Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Layer"
        API[Backend API]
        Worker[Worker Service]
        Dashboard[Dashboard]
    end
    
    subgraph "Metrics Collection"
        CloudWatch[CloudWatch Metrics]
        XRay[AWS X-Ray<br/>Distributed Tracing]
    end
    
    subgraph "Logging"
        Logs[CloudWatch Logs]
        LogInsights[CloudWatch Log Insights]
    end
    
    subgraph "Alerting"
        Alarms[CloudWatch Alarms]
        SNS[SNS Topics]
        Email[Email Notifications]
        Slack[Slack Webhooks]
    end
    
    subgraph "Dashboards"
        SystemDash[System Health Dashboard]
        BusinessDash[Business Metrics Dashboard]
    end
    
    API --> CloudWatch
    Worker --> CloudWatch
    Dashboard --> CloudWatch
    
    API --> XRay
    Worker --> XRay
    Dashboard --> XRay
    
    API --> Logs
    Worker --> Logs
    Dashboard --> Logs
    
    CloudWatch --> Alarms
    Logs --> LogInsights
    
    Alarms --> SNS
    SNS --> Email
    SNS --> Slack
    
    CloudWatch --> SystemDash
    CloudWatch --> BusinessDash
```

---

## 🎨 How to View These Diagrams

### In VS Code
Install the **Mermaid Preview** extension:
```
ext install bierner.markdown-mermaid
```

### In GitHub
Mermaid diagrams render automatically in markdown files.

### Online
Copy any diagram and paste into [Mermaid Live Editor](https://mermaid.live/)

---

**For more details, see:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
- [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md) - Implementation roadmap
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Quick overview
