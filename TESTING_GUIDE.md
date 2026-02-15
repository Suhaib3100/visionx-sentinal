# VisionX Eval - Complete System Testing Guide

## 🎯 System Overview

VisionX Eval is a complete AI-powered hackathon evaluation platform with:
- **Backend API** (NestJS + PostgreSQL)
- **Worker Service** (Amazon Nova Micro AI)
- **Dashboard** (Next.js 16)
- **VS Code Extension** (TypeScript)

---

## 📋 Prerequisites

1. **Node.js** 18+ installed
2. **PostgreSQL** database running
3. **AWS Credentials** configured (for S3 and Bedrock)
4. **VS Code** for testing extension

---

## 🚀 Complete Setup & Testing Flow

### **Phase 1: Start Backend Services**

#### 1.1 Setup Database
```bash
# Start PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE visionx_eval;

# The migrations will run automatically when backend starts
```

#### 1.2 Configure Backend
```bash
cd apps/backend

# Create .env file
cat > .env << 'EOF'
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=visionx_eval

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=visionx-snapshots

JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3000
EOF

# Install and start
npm install
npm run start:dev
```

**Expected Output:**
```
[Nest] Application successfully started
[Nest] Mapped {/auth/register, POST} route
[Nest] Mapped {/auth/login, POST} route
[Nest] Mapped {/auth/validate, POST} route
[Nest] Listening on http://localhost:3000
```

#### 1.3 Test Backend Health
```bash
curl http://localhost:3000
# Should return: {"message":"VisionX Eval API"}
```

---

### **Phase 2: Start Worker Service**

#### 2.1 Configure Worker
```bash
cd apps/worker

# Use the AWS config (Amazon Nova Micro already configured!)
cp .env.aws .env

# Verify configuration
cat .env
# Should show: AI_PROVIDER=bedrock, AI_MODEL=amazon.nova-micro-v1:0

# Install and start
npm install
npm run start:dev
```

**Expected Output:**
```
[Nest] Application successfully started
[Nest] SQS Consumer initialized
[Nest] Amazon Nova Micro AI initialized
[Nest] Worker ready to process evaluations
```

**Cost Reminder:** Amazon Nova Micro costs $0.000037 per evaluation! 🎉

---

### **Phase 3: Start Dashboard**

#### 3.1 Configure Dashboard
```bash
cd apps/dashboard

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Install and start
npm install
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.x
- Local:        http://localhost:3001
- Ready in 2.3s
```

#### 3.2 Test Dashboard
1. Open browser: `http://localhost:3001`
2. Should see VisionX Eval dashboard
3. Navigate to `/signup`
4. Create a test account

---

### **Phase 4: Test VS Code Extension**

#### 4.1 Prepare Extension
```bash
cd apps/vscode-extension

# Already compiled! Check dist/ folder
ls -la dist/
```

#### 4.2 Load Extension in VS Code
1. Open VS Code
2. Press `F1` → "Extensions: Install from VSIX..."
3. **OR** Open extension folder and press `F5` (launches Extension Development Host)

#### 4.3 Create Test Project
```bash
# Create a simple test project
mkdir ~/test-hackathon-project
cd ~/test-hackathon-project

# Initialize git
git init

# Create sample files
cat > index.js << 'EOF'
// Simple Express API
const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello VisionX!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
EOF

cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

# Open in VS Code
code .
```

#### 4.4 Authenticate Extension
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type: **"VisionX: Authenticate Team"**
3. Enter your auth token from dashboard
4. Check status bar (bottom-left) - should show "✓ VisionX: Connected"

#### 4.5 Create First Snapshot
1. Press `Cmd+Shift+P` again
2. Type: **"VisionX: Evaluate Now"**
3. Should see: "Creating snapshot..."
4. Then: "Snapshot uploaded successfully!"

#### 4.6 View Project Stats
1. Press `Cmd+Shift+P`
2. Type: **"VisionX: View Project Stats"**
3. Should open a panel showing:
   - Current Rank
   - Current Score
   - Total Snapshots
   - Last Evaluated

---

## 🧪 End-to-End Test Scenarios

### **Scenario 1: Complete Evaluation Pipeline**

1. **Create Team** (Dashboard)
   - Go to `/signup`
   - Register: `team1@test.com` / `password123`
   - Create team: "Team Awesome"

2. **Create Project** (Dashboard)
   - Navigate to Projects
   - Click "New Project"
   - Fill: Title, Description, GitHub URL
   - Copy generated auth token

3. **Connect Extension** (VS Code)
   - Open test project in VS Code
   - Run "VisionX: Authenticate Team"
   - Paste auth token
   - Status bar shows "Connected"

4. **Submit Code** (VS Code)
   - Make code changes to test project
   - Run "VisionX: Evaluate Now"
   - Watch status bar: "Evaluating..."

5. **Check Backend** (Terminal)
   ```bash
   # Backend logs should show:
   # [SnapshotsController] POST /snapshots/upload/:projectId
   # [S3Service] Uploaded snapshot to S3
   # [SQSPublisher] Published evaluation job
   ```

6. **Check Worker** (Terminal)
   ```bash
   # Worker logs should show:
   # [SQSConsumer] Received evaluation job
   # [StaticAnalysisService] Running ESLint...
   # [AIService] Calling Amazon Nova Micro...
   # [ScoringService] Calculated final score: 85.3
   ```

7. **View Results** (Dashboard)
   - Refresh dashboard leaderboard page
   - Should see team with new score
   - Click team name for detailed breakdown

---

### **Scenario 2: Auto-Evaluation Every 45 Minutes**

1. Keep VS Code open with authenticated extension
2. Make code changes
3. Wait 45 minutes (or modify timer for testing)
4. Extension automatically creates snapshot
5. Check dashboard - new evaluation appears

---

### **Scenario 3: Final Submission**

1. In VS Code: `Cmd+Shift+P`
2. Type: **"VisionX: Final Submission"**
3. Confirm dialog: "Yes, Submit Final"
4. Status bar changes to: "✔️ VisionX: Final Submitted"
5. Further evaluations are blocked
6. Dashboard shows "Final" badge on submission

---

## 🐛 Troubleshooting

### Backend Issues

**Database connection failed:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check environment variables
printenv | grep DATABASE
```

**S3 upload failed:**
```bash
# Verify AWS credentials
aws s3 ls

# Check bucket exists
aws s3 mb s3://visionx-snapshots
```

### Worker Issues

**AI evaluation failed:**
```bash
# Check AWS Bedrock access
aws bedrock list-foundation-models --region us-east-1

# Test Amazon Nova Micro specifically
aws bedrock invoke-model \
  --model-id amazon.nova-micro-v1:0 \
  --region us-east-1 \
  --body '{"messages":[{"role":"user","content":"test"}]}' \
  --cli-input-json file://test.json
```

**SQS not receiving messages:**
```bash
# Check SQS queue
aws sqs list-queues

# Send test message
aws sqs send-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/your-account/visionx-eval \
  --message-body '{"test":"message"}'
```

### Dashboard Issues

**Cannot connect to backend:**
```bash
# Verify API URL
curl http://localhost:3000/api/health

# Check CORS settings in backend
# Should allow localhost:3001
```

**Authentication fails:**
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Extension Issues

**Extension not loading:**
1. Check VS Code Output panel → VisionX
2. Verify `dist/extension.js` exists
3. Try uninstalling and reinstalling

**Authentication fails:**
```bash
# Test validate endpoint
curl -X POST http://localhost:3000/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here"}'
```

**Snapshot upload fails:**
- Check file size (< 50MB)
- Verify project ID is valid
- Check network connectivity

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
cd apps/backend
npm run start:dev

# Watch logs in real-time
tail -f logs/application.log
```

### Worker Logs
```bash
cd apps/worker
npm run start:dev

# Check evaluation progress
tail -f logs/worker.log
```

### Dashboard Dev Server
```bash
cd apps/dashboard
npm run dev

# Build logs
tail -f .next/build.log
```

---

## 🎯 Success Criteria

✅ **Backend**: All endpoints return 200/201
✅ **Worker**: AI evaluations complete with scores
✅ **Dashboard**: Leaderboard updates in real-time
✅ **Extension**: Snapshots upload successfully
✅ **End-to-End**: Code changes → Evaluation → Score update

---

## 📈 Performance Metrics

**Expected Response Times:**
- Auth login: < 200ms
- Snapshot upload: < 2s
- Static analysis: < 5s
- AI evaluation: < 10s
- Leaderboard refresh: < 100ms

**Cost per Evaluation:**
- Amazon Nova Micro: **$0.000037**
- 300 teams × 24 evaluations/day = **$0.27/day**
- Monthly cost (30 days): **$8.10**

Compare to OpenAI GPT-4: $264/day = **99.96% savings!** 🎉

---

## 🔐 Security Checklist

- [ ] JWT secrets are secure (not in git)
- [ ] AWS credentials use IAM roles (not hardcoded)
- [ ] Database passwords are strong
- [ ] CORS configured for production domains only
- [ ] Extension validates tokens before upload
- [ ] File uploads are scanned/validated
- [ ] Rate limiting enabled on API

---

## 🚢 Production Deployment

When ready to deploy:

1. **Backend**: Deploy to AWS ECS Fargate
2. **Worker**: Deploy to AWS ECS Fargate
3. **Dashboard**: Deploy to Vercel or AWS Amplify
4. **Database**: Migrate to AWS RDS PostgreSQL
5. **Extension**: Publish to VS Code Marketplace

See `DEPLOYMENT.md` for detailed instructions.

---

## 🆘 Support

For issues:
- Check logs first
- Review troubleshooting section
- Test individual components
- Verify environment variables

---

## 🎉 Next Steps

After successful testing:
1. Add more test projects
2. Simulate multiple teams
3. Load test with 100+ concurrent evaluations  
4. Fine-tune AI prompts for better scoring
5. Add custom evaluation criteria
6. Deploy to production!

**Happy Testing! 🚀**
