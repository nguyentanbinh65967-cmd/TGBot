#!/bin/bash

# Production Deployment Script
# Использование: ./scripts/deploy.sh

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production not found${NC}"
    echo "Please create .env.production with required variables"
    exit 1
fi

# Check required environment variables
echo -e "${YELLOW}📋 Checking environment variables...${NC}"
source .env.production

if [ -z "$BOT_TOKEN" ]; then
    echo -e "${RED}❌ Error: BOT_TOKEN not set${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables OK${NC}"

# Database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"

# Check if using Prisma or Drizzle
if [ -f "prisma/schema.prisma" ]; then
    echo "Using Prisma..."
    npx prisma generate
    npx prisma migrate deploy
    echo -e "${GREEN}✅ Prisma migrations completed${NC}"
elif [ -f "db/schema.ts" ]; then
    echo "Using Drizzle..."
    npx drizzle-kit generate:pg
    npx drizzle-kit migrate
    echo -e "${GREEN}✅ Drizzle migrations completed${NC}"
else
    echo -e "${YELLOW}⚠️  No database schema found, skipping migrations${NC}"
fi

# Build
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

echo -e "${GREEN}✅ Build completed${NC}"

# Deployment platform specific
if [ -n "$VERCEL" ]; then
    echo -e "${YELLOW}📦 Deploying to Vercel...${NC}"
    # Vercel will handle deployment
elif [ -n "$CF_PAGES" ]; then
    echo -e "${YELLOW}📦 Deploying to Cloudflare Pages...${NC}"
    # Cloudflare Pages will handle deployment
else
    echo -e "${YELLOW}📦 Ready for manual deployment${NC}"
fi

echo -e "${GREEN}✨ Deployment script completed!${NC}"
