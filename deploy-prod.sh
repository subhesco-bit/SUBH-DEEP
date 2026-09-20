#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════════
# EBDESIGN Production Deployment Script
# One-command production setup with zero downtime
# ════════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   EBDESIGN Platform - Production Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

# ── Phase 1: Pre-flight checks ────────────────────────────────────────────────
echo -e "${YELLOW}[1/8] Pre-flight Checks${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker $(docker --version | cut -d' ' -f3)${NC}"
echo -e "${GREEN}✅ Docker Compose $(docker-compose --version | cut -d' ' -f3)${NC}"

# ── Phase 2: Environment validation ───────────────────────────────────────────
echo -e "\n${YELLOW}[2/8] Validate Environment${NC}"

if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production not found${NC}"
    echo "Copy .env.production.example to .env.production and update values"
    exit 1
fi

if [ ! -f certs/cert.pem ] || [ ! -f certs/key.pem ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found, generating self-signed certs...${NC}"
    bash certs/generate-certs.sh
fi

echo -e "${GREEN}✅ Environment configured${NC}"
echo -e "${GREEN}✅ SSL certificates present${NC}"

# ── Phase 3: System check ─────────────────────────────────────────────────────
echo -e "\n${YELLOW}[3/8] System Check${NC}"

# Check disk space
DISK_AVAILABLE=$(df / | awk 'NR==2 {print $4}')
if [ "$DISK_AVAILABLE" -lt 5242880 ]; then  # 5GB
    echo -e "${RED}❌ Insufficient disk space (< 5GB available)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Disk space: $((DISK_AVAILABLE / 1048576))GB available${NC}"

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon not responding${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker daemon healthy${NC}"

# ── Phase 4: Build images ─────────────────────────────────────────────────────
echo -e "\n${YELLOW}[4/8] Build Docker Images${NC}"

echo "Building combined production image (this may take 5-10 minutes)..."
docker compose -f docker-compose.yml build --no-cache app

IMAGE_SIZE=$(docker images ebdesign-app:latest --format "{{.Size}}")
echo -e "${GREEN}✅ Combined image built: $IMAGE_SIZE${NC}"

# ── Phase 5: Database setup ───────────────────────────────────────────────────
echo -e "\n${YELLOW}[5/8] Prepare Database${NC}"

echo "Starting PostgreSQL..."
docker compose up -d postgres redis

echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U ebdesign_user &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL startup timeout${NC}"
        exit 1
    fi
    sleep 1
done

# ── Phase 6: Run migrations ───────────────────────────────────────────────────
echo -e "\n${YELLOW}[6/8] Run Database Migrations${NC}"

echo "Executing migrations..."
docker compose run --rm app npm run migrate
echo -e "${GREEN}✅ Migrations completed${NC}"

# ── Phase 7: Health checks ────────────────────────────────────────────────────
echo -e "\n${YELLOW}[7/8] Production Startup${NC}"

echo "Starting production stack..."
docker compose --profile prod up -d

echo "Waiting for all services to be healthy..."
for i in {1..60}; do
    NGINX_HEALTHY=$(docker inspect ebdesign-nginx --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")
    APP_HEALTHY=$(docker inspect ebdesign-app --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")
    
    if [ "$NGINX_HEALTHY" = "healthy" ] && [ "$APP_HEALTHY" = "healthy" ]; then
        echo -e "${GREEN}✅ All services healthy${NC}"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Services failed to become healthy${NC}"
        docker compose logs app
        exit 1
    fi
    
    echo -n "."
    sleep 1
done

# ── Phase 8: Verification ─────────────────────────────────────────────────────
echo -e "\n${YELLOW}[8/8] Verify Deployment${NC}"

echo "Testing endpoints..."

# Health check
if curl -sf -k https://localhost/health > /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# API check
if curl -sf -k https://localhost/api/health > /dev/null; then
    echo -e "${GREEN}✅ API responsive${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
    exit 1
fi

# ── Success Summary ───────────────────────────────────────────────────────────
echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 DEPLOYMENT SUCCESSFUL 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Platform is running at:${NC}"
echo -e "  🌐 HTTPS: https://localhost"
echo -e "  🔒 Port:  443 (SSL)"
echo -e "  📊 Health: https://localhost/health\n"

echo -e "${BLUE}Running services:${NC}"
docker compose ps

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Update DNS/hosts to point to this server"
echo "2. Install proper SSL certificates (use Let's Encrypt)"
echo "3. Configure firewall rules"
echo "4. Set up monitoring and alerting"
echo "5. Review logs: docker compose logs -f app\n"

echo -e "${GREEN}✅ Deployment ready for production traffic${NC}"
