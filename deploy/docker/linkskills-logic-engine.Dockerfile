FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY LiNKskills/services/logic-engine ./LiNKskills/services/logic-engine
COPY LiNKbot/communications/temporary-gateways/zulip ./LiNKbot/communications/temporary-gateways/zulip
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @linktrend/linkskills-logic-engine build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV LINKSKILLS_HTTP_PORT=3002
COPY --from=build /app/LiNKskills/services/logic-engine/dist ./dist
COPY --from=build /app/LiNKskills/services/logic-engine/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "dist/bin/serve.js"]
