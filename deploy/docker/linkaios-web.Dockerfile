FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY LiNKaios/linkaios-web/package.json LiNKaios/linkaios-web/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/linklogic-sdk/package.json packages/linklogic-sdk/package.json
COPY packages/observability/package.json packages/observability/package.json
COPY packages/shared-config/package.json packages/shared-config/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Relink workspace packages after full source tree copy (filter builds need auth/db deps).
RUN pnpm install --frozen-lockfile \
 && pnpm exec turbo run build --filter=@linktrend/linkaios-web

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV LINKAIOS_UI_MOCKS=0
RUN groupadd --gid 1001 linktrend \
 && useradd --uid 1001 --gid 1001 --shell /bin/bash --create-home linktrend
COPY --from=builder /app/LiNKaios/linkaios-web/public ./LiNKaios/linkaios-web/public
COPY --from=builder --chown=linktrend:linktrend /app/LiNKaios/linkaios-web/.next/standalone ./
COPY --from=builder --chown=linktrend:linktrend /app/LiNKaios/linkaios-web/.next/static ./LiNKaios/linkaios-web/.next/static
USER linktrend
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "LiNKaios/linkaios-web/server.js"]

