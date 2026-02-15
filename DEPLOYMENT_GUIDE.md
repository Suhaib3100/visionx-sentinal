# 🚀 VisionX Eval - Deployment Guide

## 💰 Cost Comparison

| Option | Cost | Best For |
|--------|------|----------|
| **AWS EC2 t3.micro** | FREE (12 months), then $6-7/month | **RECOMMENDED** - Hackathons, testing |
| AWS Lightsail | $14/month (2 containers) | Simple container deployment |
| AWS App Runner | $20-30/month | Auto-scaling production |
| AWS Lambda | $0-20/month | Variable traffic |

---

## ⚡ Quick Deploy (Recommended)

### **Option 1: AWS EC2 (Cheapest - FREE for 12 months)**

#### Step 1: Setup EC2 Instance
```bash
./scripts/setup-ec2.sh
```

This will:
- Create EC2 t3.micro instance (FREE tier eligible)
- Install Docker & Docker Compose
- Configure security groups
- Output public IP address

#### Step 2: Update Environment Files

```bash
# apps/backend/.env
DATABASE_URL=postgresql://visionx:YOUR_PASSWORD@visionx-eval-db.c0bcckgyq55z.us-east-1.rds.amazonaws.com:5432/visionx_eval
REDIS_URL=redis://localhost:6379
AWS_REGION=us-east-1
AWS_S3_BUCKET=visionx-eval-snapshots
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/668226797980/visionx-eval-jobs
PORT=3000

# apps/worker/.env
DATABASE_URL=postgresql://visionx:YOUR_PASSWORD@visionx-eval-db.c0bcckgyq55z.us-east-1.rds.amazonaws.com:5432/visionx_eval
REDIS_URL=redis://localhost:6379
AWS_REGION=us-east-1
AWS_S3_BUCKET=visionx-eval-snapshots
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/668226797980/visionx-eval-jobs
BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
```

#### Step 3: Deploy Code
```bash
# Wait 2-3 minutes for instance setup, then:
./scripts/deploy-to-ec2.sh <PUBLIC_IP>
```

#### Step 4: Verify Deployment
```bash
# Check health
curl http://<PUBLIC_IP>:3000/health

# View logs
ssh -i ~/.ssh/visionx-key.pem ec2-user@<PUBLIC_IP>
docker-compose logs -f
```

---

### **Option 2: AWS Lightsail ($14/month)**

#### Step 1: Create Services
```bash
./scripts/setup-lightsail.sh
```

#### Step 2: Deploy
```bash
./scripts/deploy-lightsail.sh
```

---

## 🌐 Deploy Dashboard to Vercel (FREE)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "feat: add deployment configs"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repo: `visionx-sentinal`
4. **Root Directory**: `apps/dashboard`
5. **Framework**: Next.js (auto-detected)
6. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=http://<EC2_PUBLIC_IP>:3000
   ```
7. Click "Deploy"

### Step 3: Update VS Code Extension

After deployment, update the extension's API URL:

```typescript
// apps/vscode-extension/src/config/constants.ts
export const API_BASE_URL = 'http://<EC2_PUBLIC_IP>:3000';
```

Then rebuild and republish:
```bash
cd apps/vscode-extension
npm run vsce-publish
```

---

## 🔒 Security Setup

### 1. Database Security Group
```bash
# Get your IP
MY_IP=$(curl -s ifconfig.me)

# Allow database access
aws ec2 authorize-security-group-ingress \
  --group-id sg-0d51d14501b975ef8 \
  --protocol tcp \
  --port 5432 \
  --cidr ${MY_IP}/32 \
  --region us-east-1
```

### 2. Set Database Password
```bash
aws rds modify-db-instance \
  --db-instance-identifier visionx-eval-db \
  --master-user-password "YourSecurePassword123!" \
  --apply-immediately \
  --region us-east-1
```

---

## 📊 Monitoring

### Check Service Status
```bash
# EC2
ssh -i ~/.ssh/visionx-key.pem ec2-user@<PUBLIC_IP>
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs worker
```

### Test Endpoints
```bash
# Health check
curl http://<PUBLIC_IP>:3000/health

# API status
curl http://<PUBLIC_IP>:3000/api/health
```

---

## 🎯 Complete Flow

1. **Backend + Worker** → AWS EC2 (FREE tier)
2. **Dashboard** → Vercel (FREE)
3. **Extension** → VS Code Marketplace (FREE)
4. **Database** → AWS RDS (existing)
5. **Storage** → AWS S3 (existing)
6. **Queue** → AWS SQS (existing)

**Total Cost**: **$0-7/month** (FREE for 12 months with AWS free tier)

---

## 🔧 Troubleshooting

### Issue: Connection timeout
```bash
# Check security group allows port 3000
aws ec2 describe-security-groups --group-names visionx-sg

# Add rule if missing
aws ec2 authorize-security-group-ingress \
  --group-name visionx-sg \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0
```

### Issue: Docker not found
```bash
# SSH into EC2 and manually install
ssh -i ~/.ssh/visionx-key.pem ec2-user@<PUBLIC_IP>
sudo yum install -y docker
sudo systemctl start docker
sudo usermod -a -G docker ec2-user
```

### Issue: Database connection failed
```bash
# Test database connectivity
psql -h visionx-eval-db.c0bcckgyq55z.us-east-1.rds.amazonaws.com \
     -U visionx \
     -d visionx_eval
```

---

## 📝 Post-Deployment Checklist

- [ ] EC2 instance running
- [ ] Backend responding at `/health`
- [ ] Worker processing jobs
- [ ] Dashboard deployed to Vercel
- [ ] Extension published to marketplace
- [ ] Test complete flow with VS Code extension
- [ ] Monitor logs for errors
- [ ] Setup CloudWatch alerts (optional)

---

## 💡 Tips

- **Use Elastic IP** for EC2 to get a permanent IP address (FREE if instance is running)
- **Enable HTTPS** with Let's Encrypt + Nginx reverse proxy
- **Setup monitoring** with AWS CloudWatch (basic metrics are free)
- **Backup strategy** - RDS automated backups are included
