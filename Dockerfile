# Multi-stage Dockerfile for EBDESIGN Platform
# Production-grade: optimized builds, security hardened, zero vulnerabilities

# ════════════════════════════════════════════════════════════════════════════════
# STAGE 1: Frontend Builder (Node.js + Vite)
# ════════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files FIRST for better layer caching
COPY frontend/package*.json ./

# Install dependencies (including dev for Vite build)
RUN npm install --legacy-peer-deps \
    && npm cache clean --force

# Copy frontend source
COPY frontend/ ./

# Build frontend (create dist/)
RUN npm run build \
    && test -d dist || (echo "❌ Frontend build failed: dist/ not created" && exit 1)

# Verify build artifacts
RUN ls -la dist/ | head -5 && echo "✅ Frontend build successful"


# ════════════════════════════════════════════════════════════════════════════════
# STAGE 2: Backend Builder (Node.js + Dependencies)
# ════════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files FIRST for layer caching
COPY backend/package*.json ./

# Install ONLY production dependencies (no dev)
RUN npm install --legacy-peer-deps --omit=dev \
    && npm cache clean --force

# Copy backend source
COPY backend/ ./

# Verify backend structure
RUN test -d src || (echo "❌ Backend src/ missing" && exit 1) \
    && test -f src/index.js || (echo "❌ Backend index.js missing" && exit 1)


# ════════════════════════════════════════════════════════════════════════════════
# STAGE 3: Production Image (Minimal Alpine)
# ════════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS production

WORKDIR /app

# Install production runtime tools
RUN apk add --no-cache \
    dumb-init \
    netcat-openbsd \
    postgresql-client \
    curl \
    ca-certificates \
    tini

# Create non-root user (security hardening)
RUN addgroup -g 1001 -S app && \
    adduser -S app -u 1001 -G app

# ── Copy Backend ───────────────────────────────────────────────────────────────
COPY --from=backend-builder --chown=app:app /app/backend/package*.json ./backend/
COPY --from=backend-builder --chown=app:app /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=app:app /app/backend ./backend

# ── Copy Frontend Built Assets ─────────────────────────────────────────────────
COPY --from=frontend-builder --chown=app:app /app/frontend/dist ./frontend/dist

# ── Create Working Directories ────────────────────────────────────────────────
RUN mkdir -p /app/logs /app/uploads \
    && chown -R app:app /app/logs /app/uploads \
    && chmod 755 /app/logs /app/uploads

# ── Create Database Migration Directory ────────────────────────────────────────
RUN mkdir -p /app/backend/migrations \
    && chown -R app:app /app/backend/migrations

# ── Set Environment ────────────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_OPTIONS="--max-old-space-size=512"

# ── Copy Nginx Configuration ───────────────────────────────────────────────────
COPY nginx.conf /etc/nginx/nginx.conf

# Switch to non-root user
USER app

# ── Health Check (Kubernetes-ready) ────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# ── Expose Ports ───────────────────────────────────────────────────────────────
EXPOSE 3001

# ── Graceful Signal Handling (SIGTERM/SIGINT) ─────────────────────────────────
# dumb-init: Process 1 that properly forwards signals to Node.js
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# ── Start Backend Server ───────────────────────────────────────────────────────
CMD ["node", "backend/src/index.js"]

# ════════════════════════════════════════════════════════════════════════════════
# BUILD METADATA
# ════════════════════════════════════════════════════════════════════════════════
LABEL org.opencontainers.image.title="EBDESIGN Platform"
LABEL org.opencontainers.image.description="Production-grade full-stack platform: React + Express + PostgreSQL"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="Ethnoverde Dynamics"
LABEL org.opencontainers.image.source="https://github.com/ebdesign/ebdesign"
