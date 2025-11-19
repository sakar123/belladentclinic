# Multi-stage Dockerfile for Next.js (clinic-portal)
# Best practices: small images, reproducible builds, non-root user

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the Next.js app
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Set a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy only the build artifacts and minimal runtime files
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000
EXPOSE 3000
USER 1001
CMD ["node", "server.js"]

