FROM node:22-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY uploads ./uploads

RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY uploads ./uploads

EXPOSE 3333
CMD ["npm", "start"]
