# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install tini and wget for signal handling and healthchecks
RUN apk add --no-cache tini wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy build output and essential files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env.example

# Set permissions
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

ENV PORT 3001

# Health check using wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use tini to manage the process
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/main"]
