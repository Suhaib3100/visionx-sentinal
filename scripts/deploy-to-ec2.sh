#!/bin/bash

# Deploy VisionX to EC2 instance

if [ -z "$1" ]; then
    echo "Usage: ./deploy-to-ec2.sh <EC2_PUBLIC_IP>"
    exit 1
fi

EC2_IP=$1
KEY_FILE="~/.ssh/visionx-key.pem"

echo "🚀 Deploying VisionX to EC2: $EC2_IP"
echo "===================================="

# Create deployment package
echo "Creating deployment package..."
tar -czf /tmp/visionx-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.next' \
    --exclude='*.log' \
    apps/backend \
    apps/worker \
    docker-compose.yml \
    package.json \
    pnpm-lock.yaml

echo "✓ Package created"

# Copy to EC2
echo "Copying files to EC2..."
scp -i $KEY_FILE /tmp/visionx-deploy.tar.gz ec2-user@${EC2_IP}:/home/ec2-user/

# Deploy on EC2
echo "Deploying on EC2..."
ssh -i $KEY_FILE ec2-user@${EC2_IP} << 'ENDSSH'
    # Extract
    tar -xzf visionx-deploy.tar.gz
    
    # Create .env files from examples
    cd apps/backend
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || echo "No .env.example found"
    fi
    cd ../worker
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || echo "No .env.example found"
    fi
    cd ../..
    
    # Start services with Docker Compose
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build
    
    echo "✓ Services started"
    
    # Show status
    docker-compose ps
ENDSSH

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo""
echo "Backend API: http://${EC2_IP}:3000"
echo "Health Check: http://${EC2_IP}:3000/health"
echo ""
echo "View logs:"
echo "  ssh -i $KEY_FILE ec2-user@${EC2_IP}"
echo "  docker-compose logs -f"
echo ""
echo "Update dashboard .env.local:"
echo "  NEXT_PUBLIC_API_URL=http://${EC2_IP}:3000"
