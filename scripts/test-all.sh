#!/bin/bash

# VisionX Eval - Test All Script
# Runs tests across all packages and apps

set -e

echo "🧪 VisionX Eval - Running All Tests"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

failed=0

echo -e "${BLUE}📦 Testing shared package...${NC}"
if pnpm --filter @visionx/shared test; then
    echo -e "${GREEN}✅ Shared tests passed${NC}"
else
    echo -e "${RED}❌ Shared tests failed${NC}"
    ((failed++))
fi

echo ""
echo -e "${BLUE}🔧 Testing backend...${NC}"
if [ -d "apps/backend" ]; then
    if pnpm --filter backend test; then
        echo -e "${GREEN}✅ Backend tests passed${NC}"
    else
        echo -e "${RED}❌ Backend tests failed${NC}"
        ((failed++))
    fi
else
    echo -e "${BLUE}ℹ️  Backend not yet created${NC}"
fi

echo ""
echo -e "${BLUE}⚙️  Testing worker...${NC}"
if [ -d "apps/worker" ]; then
    if pnpm --filter worker test; then
        echo -e "${GREEN}✅ Worker tests passed${NC}"
    else
        echo -e "${RED}❌ Worker tests failed${NC}"
        ((failed++))
    fi
else
    echo -e "${BLUE}ℹ️  Worker not yet created${NC}"
fi

echo ""
echo -e "${BLUE}🎨 Testing dashboard...${NC}"
if [ -d "apps/dashboard" ]; then
    if pnpm --filter dashboard test; then
        echo -e "${GREEN}✅ Dashboard tests passed${NC}"
    else
        echo -e "${RED}❌ Dashboard tests failed${NC}"
        ((failed++))
    fi
else
    echo -e "${BLUE}ℹ️  Dashboard not yet created${NC}"
fi

echo ""
echo -e "${BLUE}🔌 Testing VS Code extension...${NC}"
if [ -d "apps/vscode-extension" ]; then
    if pnpm --filter vscode-extension test; then
        echo -e "${GREEN}✅ Extension tests passed${NC}"
    else
        echo -e "${RED}❌ Extension tests failed${NC}"
        ((failed++))
    fi
else
    echo -e "${BLUE}ℹ️  Extension not yet created${NC}"
fi

echo ""
echo "===================================="
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $failed test suite(s) failed${NC}"
    exit 1
fi
