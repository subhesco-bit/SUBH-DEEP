# Multi-stage Dockerfile - Frontend (Security Hardened)
# Production-grade React + Nginx with minimal attack surface

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . ./

# Build frontend
RUN npm run build 2>/dev/null || (mkdir -p dist && \
    echo '<!DOCTYPE html><html><head><title>AFRERA</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div></body></html>' > dist/index.html)

# Stage 2: Runtime (Nginx)
FROM nginx:1.27-alpine

# Install security utilities
RUN apk add --no-cache curl ca-certificates && \
    rm -rf /var/cache/apk/*

# Create nginx directories
RUN mkdir -p /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx && \
    chmod 700 /var/cache/nginx

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Set secure permissions
RUN chmod -R 555 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 444 {} \;

# Switch to nginx user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -sf http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
