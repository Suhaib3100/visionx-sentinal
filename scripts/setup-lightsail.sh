#!/bin/bash

# Setup AWS Lightsail Container Services
# Run this once before deploying

set -e

echo "🔧 Setting up AWS Lightsail Container Services"
echo "=============================================="

AWS_REGION="us-east-1"
BACKEND_SERVICE="visionx-backend"
WORKER_SERVICE="visionx-worker"

# Load environment variables
if [ ! -f "apps/backend/.env" ]; then
    echo "❌ apps/backend/.env not found!"
    exit 1
fi

# Read database URL
source apps/backend/.env

echo "Creating backend container service..."
aws lightsail create-container-service \
  --service-name $BACKEND_SERVICE \
  --power nano \
  --scale 1 \
  --region $AWS_REGION \
  --public-domain-names \
    "publicEndpoint={containerName=backend,containerPort=3000,healthCheck={path='/health'}}"

echo "✓ Backend service created"

echo "Creating worker container service..."
aws lightsail create-container-service \
  --service-name $WORKER_SERVICE \
  --power nano \
  --scale 1 \
  --region $AWS_REGION

echo "✓ Worker service created"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Container services created:"
echo "- Backend: $BACKEND_SERVICE (nano - \$7/month)"
echo "- Worker: $WORKER_SERVICE (nano - \$7/month)"
echo ""
echo "Total cost: ~\$14/month"
echo ""
echo "Note: Services take 2-3 minutes to become active"
echo "Check status: aws lightsail get-container-services --region $AWS_REGION"
echo ""
echo "Next: Run ./scripts/deploy-lightsail.sh to deploy your code"
