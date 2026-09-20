# Multi-stage Dockerfile - Backend (Security Hardened)
# Production-grade Node.js with minimal attack surface

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ ca-certificates

# Copy package files
COPY package*.json ./

# Install dependencies with security focus
RUN npm ci --only=production --legacy-peer-deps

# Stage 2: Runtime (Minimal)
FROM node:20-alpine

WORKDIR /app

# Install only essential runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user with restricted shell
RUN addgroup -g 1001 -S ebdesign && \
    adduser -S ebdesign -u 1001 -G ebdesign -s /sbin/nologin

# Copy package files
COPY package*.json ./

# Copy node_modules from builder
COPY --from=builder --chown=ebdesign:ebdesign /app/node_modules ./node_modules

# Copy application code
COPY --chown=ebdesign:ebdesign src ./src

# Create application directories
RUN mkdir -p /app/{logs,uploads,tmp} && \
    chown -R ebdesign:ebdesign /app && \
    chmod 700 /app/logs /app/uploads /app/tmp && \
    chmod 550 /app/src

# Create entrypoint script
RUN printf '#!/bin/sh\nset -e\necho "Starting EBDESIGN backend..."\nexec npm start\n' > /app/entrypoint.sh && \
    chmod 550 /app/entrypoint.sh && \
    chown ebdesign:ebdesign /app/entrypoint.sh

# Switch to non-root user
USER ebdesign

# Expose API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -sf http://localhost:3001/health || exit 1

# Use dumb-init for signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["/app/entrypoint.sh"]
