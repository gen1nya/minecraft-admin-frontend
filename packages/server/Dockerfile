FROM node:20-alpine

WORKDIR /app

# Copy root package files for workspaces
COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN npm ci --workspace=@mcp/server

# Copy server source
COPY packages/server ./packages/server

# Build TypeScript
RUN npm run build --workspace=@mcp/server

WORKDIR /app/packages/server

EXPOSE 3001

CMD ["node", "dist/index.js"]
