FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
ARG APP_NAME
RUN turbo prune ${APP_NAME} --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Development stage
FROM installer AS development
WORKDIR /app
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run generate
CMD pnpm --filter ${APP_NAME} dev

# Build stage for production
FROM installer AS build
WORKDIR /app
ARG APP_NAME
COPY --from=installer /app .
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run generate
RUN pnpm turbo run build --filter=${APP_NAME}...

# Production runner
FROM base AS production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
COPY --from=build /app .
CMD pnpm --filter ${APP_NAME} start
