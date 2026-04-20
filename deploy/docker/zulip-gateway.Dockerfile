# syntax=docker/dockerfile:1
# Build from repository root: docker build -f deploy/docker/zulip-gateway.Dockerfile .
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.9.6 prune @linktrend/zulip-gateway --docker --out-dir=/prune

FROM base AS build
COPY --from=pruner /prune/json/ .
COPY --from=pruner /prune/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /prune/full/ .
COPY tsconfig.base.json /app/tsconfig.base.json
RUN pnpm exec turbo run build --filter=@linktrend/zulip-gateway
RUN pnpm --filter=@linktrend/zulip-gateway deploy --prod --legacy /out/app

FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 1001 linktrend \
  && useradd --uid 1001 --gid 1001 --shell /bin/bash --create-home linktrend
COPY --from=build /out/app/ ./
USER linktrend
EXPOSE 8790
CMD ["node", "dist/index.js"]
