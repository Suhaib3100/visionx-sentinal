#!/bin/bash

# VisionX Eval - Build All Script
# Builds all packages and apps

set -e

echo "🏗️  VisionX Eval - Building All"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building shared package...${NC}"
pnpm --filter @visionx/shared build

echo -e "${BLUE}🔧 Building backend...${NC}"
if [ -d "apps/backend" ]; then
    pnpm --filter backend build
else
    echo -e "${BLUE}ℹ️  Backend not yet created${NC}"
fi

echo -e "${BLUE}⚙️  Building worker...${NC}"
if [ -d "apps/worker" ]; then
    pnpm --filter worker build
else
    echo -e "${BLUE}ℹ️  Worker not yet created${NC}"
fi

echo -e "${BLUE}🎨 Building dashboard...${NC}"
if [ -d "apps/dashboard" ]; then
    pnpm --filter dashboard build
else
    echo -e "${BLUE}ℹ️  Dashboard not yet created${NC}"
fi

echo -e "${BLUE}🔌 Building VS Code extension...${NC}"
if [ -d "apps/vscode-extension" ]; then
    pnpm --filter vscode-extension build
else
    echo -e "${BLUE}ℹ️  Extension not yet created${NC}"
fi

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
