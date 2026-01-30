#!/bin/bash

# Script для проверки правильности настройки Environment Variables
# Использование: ./scripts/check-env.sh

set -e

echo "🔍 Checking environment variables configuration..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка через Vercel CLI (если установлен)
if command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Checking Vercel environment variables...${NC}"
    
    # Получаем список переменных
    ENV_VARS=$(vercel env ls 2>/dev/null || echo "")
    
    if [ -n "$ENV_VARS" ]; then
        echo "$ENV_VARS"
        echo -e "${GREEN}✅ Vercel CLI доступен${NC}"
        echo -e "${YELLOW}⚠️  Вручную проверьте, что:${NC}"
        echo "   - BOT_TOKEN в Production scope ≠ BOT_TOKEN в Preview scope"
        echo "   - DATABASE_URL в Production scope ≠ DATABASE_URL в Preview scope"
    else
        echo -e "${YELLOW}⚠️  Vercel CLI не настроен или проект не связан${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Vercel CLI не установлен${NC}"
    echo "Установите: npm i -g vercel"
fi

# Проверка локальных env файлов
echo ""
echo -e "${YELLOW}Checking local environment files...${NC}"

if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ .env.production найден${NC}"
    
    # Проверяем наличие критичных переменных
    if grep -q "BOT_TOKEN=" .env.production; then
        echo -e "${GREEN}✅ BOT_TOKEN найден${NC}"
    else
        echo -e "${RED}❌ BOT_TOKEN не найден${NC}"
    fi
    
    if grep -q "DATABASE_URL=" .env.production; then
        echo -e "${GREEN}✅ DATABASE_URL найден${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL не найден${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.production не найден (это нормально для Vercel)${NC}"
fi

# Проверка, что нет production значений в preview
echo ""
echo -e "${YELLOW}Checking for production values in preview scope...${NC}"
echo -e "${YELLOW}⚠️  Вручную проверьте в Vercel Dashboard:${NC}"
echo "   - Project → Settings → Environment Variables"
echo "   - Убедитесь, что production secrets НЕ в Preview scope"

echo ""
echo -e "${GREEN}✨ Environment check completed!${NC}"
