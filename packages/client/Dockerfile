# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspaces
COPY package.json package-lock.json ./
COPY packages/client/package.json ./packages/client/

# Install dependencies
RUN npm ci --workspace=@mcp/client

# Copy client source
COPY packages/client ./packages/client

# Build
RUN npm run build --workspace=@mcp/client

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Nginx config for SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://mc-admin-server:3001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /ws { \
        proxy_pass http://mc-admin-server:3001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_read_timeout 86400; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
