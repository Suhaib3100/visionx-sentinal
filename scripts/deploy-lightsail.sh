#!/bin/bash

# VisionX Eval - AWS Lightsail Deployment Script
# Cheapest AWS option: $3.50/month per container = $7/month total

set -e

echo "🚀 VisionX Eval - AWS Lightsail Deployment"
echo "==========================================="

# Configuration
AWS_REGION="us-east-1"
BACKEND_SERVICE_NAME="visionx-backend"
WORKER_SERVICE_NAME="visionx-worker"
BACKEND_PORT=3000

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install: brew install awscli"
    exit 1
fi

echo -e "${YELLOW}Step 1: Build Docker images${NC}"
echo "-------------------------------------------"

# Backend
echo "Building backend..."
cd apps/backend
docker build -t visionx-backend:latest .
echo -e "${GREEN}✓ Backend built${NC}"

# Worker
echo "Building worker..."
cd ../worker
docker build -t visionx-worker:latest .
echo -e "${GREEN}✓ Worker built${NC}"

cd ../..

echo -e "\n${YELLOW}Step 2: Push to AWS Lightsail${NC}"
echo "-------------------------------------------"

# Push backend
echo "Pushing backend to Lightsail..."
aws lightsail push-container-image \
  --service-name $BACKEND_SERVICE_NAME \
  --label backend-latest \
  --image visionx-backend:latest \
  --region $AWS_REGION

echo -e "${GREEN}✓ Backend pushed${NC}"

# Push worker
echo "Pushing worker to Lightsail..."
aws lightsail push-container-image \
  --service-name $WORKER_SERVICE_NAME \
  --label worker-latest \
  --image visionx-worker:latest \
  --region $AWS_REGION

echo -e "${GREEN}✓ Worker pushed${NC}"

echo -e "\n${GREEN}=========================================="
echo "✅ Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check backend: https://${BACKEND_SERVICE_NAME}.${AWS_REGION}.cs.amazonlightsail.com"
echo "2. Update dashboard .env.local with backend URL"
echo "3. Deploy dashboard to Vercel"
echo ""
echo "Cost: ~\$7/month (fixed)"
