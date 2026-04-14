FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package.json package-lock.json turbo.json ./
COPY apps/portfolio/package.json apps/portfolio/package.json
COPY apps/maestros-del-salmon/package.json apps/maestros-del-salmon/package.json
COPY apps/studio/package.json apps/studio/package.json

RUN npm ci

COPY . .

RUN npm run build --workspace=apps/maestros-del-salmon
RUN npm prune --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /workspace/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /workspace/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /workspace/package-lock.json ./package-lock.json
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/maestros-del-salmon ./apps/maestros-del-salmon

USER nextjs

EXPOSE 8080

CMD ["npm", "run", "start", "--workspace=apps/maestros-del-salmon", "--", "-p", "8080", "-H", "0.0.0.0"]
