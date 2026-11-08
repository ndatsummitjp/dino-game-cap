FROM node:24-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci && npm run build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/gen ./gen

RUN npm ci --omit=dev --prefix /app/gen/srv \
    && npm install --omit=dev --prefix /app/gen/pg

WORKDIR /app/gen/srv

EXPOSE 4004

CMD ["sh", "-c", "cd ../pg && npm start && cd ../srv && exec npm start"]
