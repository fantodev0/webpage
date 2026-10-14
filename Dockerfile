FROM node:22-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.11.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile \
    --allow-build=@parcel/watcher \
    --allow-build=esbuild \
    --allow-build=lmdb \
    --allow-build=msgpackr-extract

COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist/webpage ./dist/webpage

USER node

EXPOSE 4000

CMD ["node", "dist/webpage/server/server.mjs"]
