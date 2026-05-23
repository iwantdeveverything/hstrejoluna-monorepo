FROM node:20-alpine AS builder

WORKDIR /workspace

# Install pnpm via corepack
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/portfolio/package.json apps/portfolio/package.json
COPY apps/maestros-del-salmon/package.json apps/maestros-del-salmon/package.json
COPY apps/studio/package.json apps/studio/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/compliance/package.json packages/compliance/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm turbo run build --filter=portfolio

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /workspace/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /workspace/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /workspace/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nextjs:nodejs /workspace/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/portfolio ./apps/portfolio

USER nextjs

EXPOSE 8080

WORKDIR /app/apps/portfolio

CMD ["../../node_modules/.bin/next", "start", "-p", "8080", "-H", "0.0.0.0"]
