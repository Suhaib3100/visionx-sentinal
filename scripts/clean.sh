#!/bin/bash

# VisionX Eval - Clean Script
# This script cleans build artifacts and dependencies

set -e

echo "🧹 VisionX Eval - Clean Script"
echo "==============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  This will remove all build artifacts and dependencies${NC}"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo -e "${BLUE}🗑️  Removing node_modules...${NC}"
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

echo -e "${BLUE}🗑️  Removing build artifacts...${NC}"
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name "build" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +
find . -name "coverage" -type d -prune -exec rm -rf '{}' +
find . -name ".turbo" -type d -prune -exec rm -rf '{}' +

echo -e "${BLUE}🗑️  Removing lock files...${NC}"
rm -f pnpm-lock.yaml

echo -e "${BLUE}🐳 Stopping Docker containers...${NC}"
docker-compose down

echo -e "${YELLOW}⚠️  Do you want to remove Docker volumes (database data)?${NC}"
read -p "Remove volumes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🗑️  Removing Docker volumes...${NC}"
    docker-compose down -v
    echo -e "${GREEN}✅ Docker volumes removed${NC}"
fi

echo -e "${GREEN}✅ Clean complete!${NC}"
echo ""
echo "To set up again, run: ${BLUE}./scripts/setup.sh${NC}"
echo ""
