# syntax=docker/dockerfile:1
# Build from repository root: docker build -f deploy/docker/linkaios-web.Dockerfile .
# NEXT_PUBLIC_* must be passed at image build time (Compose `build.args`).
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.9.6 prune @linktrend/linkaios-web --docker --out-dir=/prune

FROM base AS build
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
COPY --from=pruner /prune/json/ .
COPY --from=pruner /prune/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /prune/full/ .
COPY tsconfig.base.json /app/tsconfig.base.json
RUN pnpm exec turbo run build --filter=@linktrend/linkaios-web

FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 1001 linktrend \
  && useradd --uid 1001 --gid 1001 --shell /bin/bash --create-home linktrend
COPY --from=build /app/apps/linkaios-web/.next/standalone/ ./
COPY --from=build /app/apps/linkaios-web/.next/static ./apps/linkaios-web/.next/static
COPY --from=build /app/apps/linkaios-web/public ./apps/linkaios-web/public
USER linktrend
EXPOSE 3000
CMD ["node", "apps/linkaios-web/server.js"]
