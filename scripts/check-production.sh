#!/bin/bash

# Production Health Check Script
# Использование: ./scripts/check-production.sh https://app.example.com

set -e

URL=${1:-"https://app.example.com"}

echo "🔍 Checking production deployment: $URL"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check HTTPS
echo -e "${YELLOW}Checking HTTPS...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200"; then
    echo -e "${GREEN}✅ HTTPS OK${NC}"
else
    echo -e "${RED}❌ HTTPS failed${NC}"
    exit 1
fi

# Check SSL certificate
echo -e "${YELLOW}Checking SSL certificate...${NC}"
if echo | openssl s_client -connect $(echo $URL | sed 's|https://||' | sed 's|/.*||'):443 -servername $(echo $URL | sed 's|https://||' | sed 's|/.*||') 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✅ SSL certificate valid${NC}"
else
    echo -e "${RED}❌ SSL certificate invalid${NC}"
fi

# Check security headers
echo -e "${YELLOW}Checking security headers...${NC}"
HEADERS=$(curl -s -I "$URL")

if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✅ HSTS header present${NC}"
else
    echo -e "${YELLOW}⚠️  HSTS header missing${NC}"
fi

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
else
    echo -e "${YELLOW}⚠️  X-Frame-Options header missing${NC}"
fi

# Check if app loads
echo -e "${YELLOW}Checking application load...${NC}"
if curl -s "$URL" | grep -q "<!DOCTYPE html\|<html"; then
    echo -e "${GREEN}✅ Application loads${NC}"
else
    echo -e "${RED}❌ Application failed to load${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Health check completed!${NC}"
