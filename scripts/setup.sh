#!/bin/bash

# VisionX Eval - Setup Script
# This script sets up the development environment

set -e

echo "🚀 VisionX Eval - Setup Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm is not installed. Installing pnpm...${NC}"
    npm install -g pnpm
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

echo -e "${BLUE}🏗️  Building shared package...${NC}"
pnpm --filter @visionx/shared build

echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
docker-compose up -d postgres redis

echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file. Please update with your credentials.${NC}"
fi

echo -e "${BLUE}🎣 Setting up Git hooks...${NC}"
pnpm prepare

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Update .env file with your credentials"
echo "  2. Start development:"
echo "     ${BLUE}pnpm dev${NC}"
echo ""
echo "Optional tools:"
echo "  - pgAdmin: http://localhost:5050 (suhaib@percify.io / Zaka310@)"
echo "  - Redis Commander: http://localhost:8081"
echo "  To start tools: ${BLUE}docker-compose --profile tools up -d${NC}"
echo ""
